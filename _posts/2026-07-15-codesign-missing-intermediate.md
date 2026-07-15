---
layout: post
title:  "errSecInternalComponent: The Intermediate Certificate Your Mac Runner Cannot See"
date:   2026-07-15 02:30:00 -0400
categories: tech
tags: [ci-cd, macos, code-signing, fastlane, github-actions, self-hosted]
description: "A codesign failure on a self-hosted Mac runner that looked random but came down to where the WWDR intermediate certificate lived, and how fast the build reached the signing step."
comments: false
permalink: /codesign-missing-intermediate
---

If you run CI on your own Mac, sooner or later you will meet this:

```
Warning: unable to build chain to self-signed root for signer "Apple Distribution: REDACTED (TEAMID)"
/Users/ci/.../Build/.../Applications/App.app: errSecInternalComponent
Command CodeSign failed with a nonzero exit code
** ARCHIVE FAILED **
```

Same machine, same config, same certificates. One build signs perfectly. The next one, minutes
later, dies. Re-run it and it might pass. That flakiness is the whole difficulty, because it makes
every theory look plausible and every fix look like it worked.

Here is what is actually going on.

## TL;DR

- To sign, macOS builds a chain: **your Apple Distribution cert (leaf) to Apple's WWDR G3
  (intermediate) to Apple Root CA (root)**.
- The root ships with macOS. The leaf arrives with your signing identity. The **intermediate is the
  one nobody installs on purpose**, and on a fresh CI box it may not be permanently installed at all.
- CI tooling creates a **brand new throwaway keychain per build** and imports the identity into it.
  The intermediate often comes along for the ride. Nothing persistent is guaranteed to hold it.
- **Observed:** whether signing succeeds tracks **how long the build ran before it signed**. Slow
  build, chain resolves. Fast build with a warm cache, `MissingIntermediate`.
- **Best explanation, and this is inference rather than documented behaviour:** trust evaluation does
  not immediately recognise an intermediate that only exists in a keychain created seconds earlier.
- **Fix:** install WWDR G3 into the **login keychain**, which is persistent and always searched. The
  fix stands regardless of which mechanism is really behind the timing.
- `errSecInternalComponent` tells you nothing. The real error is in the unified log:
  `Trust evaluate failure: [leaf MissingIntermediate]`.

In one picture:

```text
BROKEN: the intermediate only lives in the throwaway keychain

  per-build keychain  (created seconds ago)
    Apple Distribution  (leaf)
    WWDR G3             (intermediate)   <-- present, but not used at evaluation time
  system trust store
    Apple Root CA       (root)

  trust evaluation  ->  MissingIntermediate  ->  errSecInternalComponent


FIXED: the intermediate lives somewhere persistent

  login keychain      (persistent, always searched)
    WWDR G3             (intermediate)
  per-build keychain  (created seconds ago)
    Apple Distribution  (leaf)
  system trust store
    Apple Root CA       (root)

  trust evaluation  ->  leaf -> WWDR G3 -> Apple Root CA  ->  signed
```

## What codesign is actually trying to do

Signing is not "use this certificate". It is "build a valid chain from this certificate up to a
root the system trusts". Three links:

1. **Leaf**: your `Apple Distribution` certificate. Comes from your signing setup on every build.
2. **Intermediate**: `Apple Worldwide Developer Relations Certification Authority`, currently **G3**.
   This is the link that gets forgotten.
3. **Root**: `Apple Root CA`. Ships with macOS in the system trust store. Never your problem.

Break the middle link and the chain cannot reach the root. codesign reports that as
`unable to build chain to self-signed root`, and then fails with `errSecInternalComponent`, which is
a generic wrapper that could mean almost anything.

## Where the intermediate was actually coming from

Here is the part that surprised me. The machine had **no WWDR G3 installed anywhere**. Not in the
system keychain, not in the login keychain. And yet builds were passing.

You can see what a successful build actually used, because codesign embeds the chain it built into
the signature:

```
$ codesign -d --extract-certificates SomeApp.app
$ for f in codesign0 codesign1 codesign2; do openssl x509 -inform DER -in $f -noout -subject; done

subject= /UID=.../CN=Apple Distribution: REDACTED (TEAMID)/...
subject= /CN=Apple Worldwide Developer Relations Certification Authority/OU=G3/O=Apple Inc./C=US
subject= /C=US/O=Apple Inc./OU=Apple Certification Authority/CN=Apple Root CA
```

There it is. G3, in the chain, on a machine where G3 was not installed.

The explanation is that the intermediate was arriving **transiently**. Modern CI signing (fastlane
match and friends) creates a fresh, disposable keychain for each build and imports the signing
identity into it. A `.p12` often carries the chain along with the key, though not always, so the
intermediate usually lands in that throwaway keychain. macOS can also retrieve a missing intermediate
on demand, depending on network availability and on the certificate carrying the metadata that says
where to fetch it, so that path is not guaranteed either. Either way, the intermediate existed only
for the life of that build, in a keychain that was born seconds earlier.

## Why it looked random

This is the bit worth internalising, because the surface pattern is deeply misleading.

Two apps built back to back from one project. The first always passed, the second usually failed. It
looks like ordering. It looks like two builds fighting over shared state. It is neither.

The difference is **how long each build ran before it reached codesign**:

| | Build A | Build B |
|---|---|---|
| Compile before signing | ~80 seconds | ~20 seconds (reuses A's warm build cache) |
| Keychain age at signing | ~80 seconds | ~20 seconds |
| Result | signs fine | `MissingIntermediate` |

Every "it fails when builds are close together" and "the second one always breaks" correlation is a
shadow of that one variable.

Because it is easy to read the next part as established fact, let me split what I measured from what
I concluded.

### Observed

- The intermediate was not persistently installed anywhere on the machine.
- CI created a new keychain per build, and the identity (carrying the intermediate) was imported
  into it.
- Builds that compiled for ~80 seconds before signing succeeded.
- Builds that reached codesign ~20 seconds after their keychain was created failed with
  `MissingIntermediate`.
- Installing G3 explicitly **into the per-build keychain** did not help. The log confirmed it landed,
  and the build still failed with `MissingIntermediate` about twenty seconds later. So the
  certificate being *present* was not sufficient.
- Installing G3 into the **login keychain** stopped the failures, including a fast build signing four
  seconds after the previous one finished.

### Hypothesis

The explanation that fits all of the above: **trust evaluation does not immediately recognise an
intermediate that only exists in a keychain created seconds earlier.**

That is inference, not documented behaviour. Apple does not state anywhere that certificates in young
keychains are unusable, and the same observations are consistent with other mechanisms I did not rule
out:

- trustd cache timing
- keychain search list propagation
- securityd IPC or certificate database indexing delay
- on-demand (AIA) intermediate retrieval timing
- something specific to how the signing tool imports the identity

Several of those are difficult to separate from the outside. The experiment that would sharpen it:
take a failing case and repeat the signing step alone, with no compilation, once immediately and once
after a `sleep 60`, changing nothing else. If the sleep alone flips it, keychain age (or something
that tracks it) is the variable. If it does not, the mechanism is elsewhere and only the fix survives.

What I can say without hedging: build duration predicted success, presence of the certificate did
not, and moving the intermediate somewhere persistent removed the problem.

## Reading the real error

`errSecInternalComponent` is a dead end. The actual reason lives in the macOS unified log, which has
the Security framework internals. On the runner, around the second the build died:

```
/usr/bin/log show --start "2026-07-14 22:32:15" --end "2026-07-14 22:32:45" --info --style compact
```

(If you SSH in and `log` complains about `too many arguments`, your shell has a builtin shadowing it.
Use the full path.)

Filter for the signing process and there is no ambiguity at all:

```
codesign[...] [com.apple.securityd:security_exception] CSSM Exception: -2147409622 CSSMERR_TP_NOT_TRUSTED
trustd[...]   [com.apple.securityd:policy] cert[0]: MissingIntermediate =(leaf)[force]> 0
codesign[...] [com.apple.securityd:SecError] Trust evaluate failure: [leaf MissingIntermediate]
```

`MissingIntermediate`. Not a race, not an ACL, not a locked keychain. The middle of the chain was not
reachable at evaluation time. Two minutes in the log beats two days of theories.

## The fix

Put the intermediate somewhere **persistent and always searched**, so it does not matter how fast
the build signs. The login keychain is exactly that, and it needs no sudo:

```bash
curl -fsSLO https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer
security add-certificates -k ~/Library/Keychains/login.keychain-db AppleWWDRCAG3.cer
```

Verify it against a real leaf rather than trusting the absence of red text:

```
$ codesign -d --extract-certificates SomeApp.app
$ security verify-cert -c codesign0 -p codeSign
...certificate verification successful.
```

Do it in your CI config too, not just by hand, so a rebuilt or replaced runner does not quietly
reintroduce the same flake. Installing it into the per-build keychain as well is harmless, but the
persistent copy is the one doing the work.

After that, back-to-back builds that had been failing for days went green, including the fast one
signing four seconds after the slow one finished.

## About that expired certificate you are going to find

While digging you will very likely notice your machine has an `Apple Worldwide Developer Relations
Certification Authority` certificate that **expired in February 2023**:

```
notBefore=Feb  7 21:48:47 2013 GMT
notAfter=Feb  7 21:48:47 2023 GMT

$ security verify-cert -c wwdr.pem -p basic
Cert Verify Result: CSSMERR_TP_CERT_EXPIRED
```

That is the old WWDR. It is worth cleaning up, and half the internet will tell you it is your bug.
Be careful there: on this machine builds were passing with that expired certificate sitting in the
system keychain the whole time, so its presence alone was not what broke signing. Tidy it up as
hygiene, but confirm the actual failure in the log before you declare victory.

Related trap: your tooling may print

```
There are no local code signing identities found.
(Check in Keychain Access for an expired WWDR certificate: ...)
```

`security find-identity -v` only lists identities whose chain **validates**, so a chain problem makes
your identity invisible and triggers that generic hint. It shows up whether or not you actually have
an expired WWDR, and it showed up on passing builds too. It is a symptom of a broken chain, not a
diagnosis of why.

## The checklist

Staring at `errSecInternalComponent` right now? In this order:

1. **Read the real error.** `/usr/bin/log show --start "..." --info --style compact`, grep for your
   signing process. `MissingIntermediate` and `NOT_TRUSTED` are the truth. The `errSec` code is not.
2. **Check what a working signature used**, if you have one:
   `codesign -d --extract-certificates` and inspect the chain.
3. **Install WWDR G3 into the login keychain**, not a temporary one.
4. **Verify against a real leaf**: `security verify-cert -c <leaf> -p codeSign`.
5. **Then** worry about expired certificates, ACLs, partition lists, and races. In that order,
   because that is the reverse of how tempting they are.

## Three things worth keeping

**A generic error code deserves a specific log.** `errSec*` and `CSSMERR_*` are wrappers over an
internal error that has a real name. On macOS the unified log has that name. Go get it before you
theorise.

**Timing correlations are the most seductive kind.** "Fails when builds are close together" was true
across a dozen runs and completely meaningless. Races are real and common enough that your brain
files a timing pattern under "solved" and stops looking. If you cannot name the mechanism, you have a
pattern, not a diagnosis.

**Ephemeral keychains quietly assume immediacy.** Creating a throwaway keychain per build is good
hygiene, and it silently assumes everything you put in it is usable right away. On this machine it
was not. In practice, for CI runners, anything needed for chain building is safest in a persistent
keychain.

## References

- [Apple PKI / certificate authority](https://www.apple.com/certificateauthority/), where the WWDR
  intermediates are published for download.
- [Technical Note TN2206: macOS Code Signing In Depth](https://developer.apple.com/library/archive/technotes/tn2206/_index.html),
  archived but still the best single description of how signing and chain validation fit together.
- [SecTrust](https://developer.apple.com/documentation/security/sectrust), the trust evaluation API
  underneath what codesign is doing when it builds and validates the chain.

Worth noting that none of these document the timing behaviour above, which is exactly why I have
labelled it a hypothesis rather than a fact.
