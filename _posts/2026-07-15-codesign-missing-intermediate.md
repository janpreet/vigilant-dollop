---
layout: post
title:  "errSecInternalComponent: Two Days, Three Wrong Fixes, and One Log Line"
date:   2026-07-15 02:30:00 -0400
categories: tech
tags: [ci-cd, macos, code-signing, fastlane, github-actions, self-hosted]
description: "An intermittent codesign failure on a self-hosted Mac runner, the timing correlation that sent me down three dead ends, and the one securityd log line that explained everything."
comments: false
permalink: /codesign-missing-intermediate
---

I lost two days to an intermittent code signing failure on a self-hosted Mac CI runner. I shipped
three fixes based on three different theories. All three were wrong. The actual answer was sitting
in a system log the whole time, and the tool had also printed a hint pointing at it in the very
first failing build.

This is a post about the debugging, not the bug, because the bug is boring and the debugging is
where the lessons are.

## TL;DR

- **Symptom:** `codesign` intermittently fails with `errSecInternalComponent` and
  `Warning: unable to build chain to self-signed root`. Same machine, same config, one build
  passes and the next fails.
- **Actual cause, part one:** the machine had no valid **WWDR G3** intermediate certificate. Its
  only copy was the old WWDR, which **expired in February 2023**. Modern Apple Distribution certs
  are issued by G3, so the chain leaf to intermediate to root could not be built.
- **Actual cause, part two:** installing G3 into the **short-lived per-build keychain was not
  enough**. Trust evaluation does not reliably see certificates added to a keychain that is a few
  seconds old. It has to go somewhere persistent, like the login keychain.
- **Why it looked intermittent:** builds that compiled for a while before signing passed, because
  `trustd` had time to catch up (and could sometimes fetch the intermediate over the network).
  Fast, cache-warm builds signed too soon and failed.
- **The lesson:** `errSec*` errors are generic wrappers. When one shows up, read the system log
  from the failing process, not just your CI output.

## The symptom

Two apps built from the same project, one after the other, on the same self-hosted Mac runner. The
first would sign fine. The second would die at the very end of the archive:

```
Warning: unable to build chain to self-signed root for signer "Apple Distribution: REDACTED (TEAMID)"
/Users/ci/.../Build/.../Applications/App.app: errSecInternalComponent
Command CodeSign failed with a nonzero exit code
** ARCHIVE FAILED **
```

Not every time. Maybe seventy percent of the time. Re-running the job would often make it pass,
which is the single most expensive property a bug can have, because it lets you believe you fixed
something when you did not.

## The beautiful theory

I did what you do: I gathered data. And the data was gorgeous.

Every failing build had started within about ten seconds of the previous build's signing step.
Every passing build had more than a minute of daylight. I checked this across a dozen runs and it
held every single time. Two runner slots share one physical machine, so they share one `securityd`.
Two signings landing on top of each other, one shared security daemon, a beautiful little race.

That is a *fantastic* theory. It explains the intermittency. It explains the ordering. It fits
every data point I had. It was also completely wrong.

## Three wrong fixes

**Wrong fix one: unique keychain names.** If two builds are stomping the same temp keychain path,
give each build its own. Shipped it. The build after the merge failed exactly the same way, with
the shiny new per-build keychain named right there in the log.

**Wrong fix two: re-assert the key ACL.** Maybe the private key's partition list is not granting
`codesign` non-interactive access. Re-run `unlock-keychain` and `set-key-partition-list` right
before archiving. This is the top answer for `errSecInternalComponent` on basically every forum,
so it felt like sure footing. It changed nothing. Worth noting: those commands **exited 0 in the
builds that failed**, which should have told me louder than it did that I was not looking at an ACL
problem.

**Wrong fix three: retry past the race.** If it is transient, wait for the daemon to settle and
re-archive. I gated it on the specific error, bounded it to three attempts, tested the control flow,
and shipped it feeling pretty good.

It fired perfectly. And it failed all three attempts, sixty seconds apart:

```
CodeSign hit the transient errSecInternalComponent race (attempt 1/3); retrying after settle.
...
CodeSign hit the transient errSecInternalComponent race (attempt 2/3); retrying after settle.
...
** ARCHIVE FAILED **
```

That failure is the most useful thing that happened in two days. A transient race does not survive
three minutes of waiting. Whatever this was, time did not heal it, so it was never about time. My
correlation was real, and my mechanism was fiction.

## The turn

I stopped theorising and went to read what the failing component itself had to say. On macOS, the
unified log has the actual Security framework internals. So, on the runner, around the exact second
the build died:

```
/usr/bin/log show --start "..." --end "..." --info --style compact
```

(If you SSH into a Mac and `log` throws `too many arguments`, that is your shell's builtin
shadowing it. Use the full path.)

Filtering that firehose for the `codesign` process gave me this:

```
codesign[...] [com.apple.securityd:security_exception] CSSM Exception: -2147409622 CSSMERR_TP_NOT_TRUSTED
codesign[...] [com.apple.securityd:SecError] Trust evaluate failure: [leaf MissingIntermediate]
codesign[...] [com.apple.securityd:security_exception] MacOS error: -2070
```

`Trust evaluate failure: [leaf MissingIntermediate]`.

Not a race. Not an ACL. Not a locked keychain. The certificate chain was missing its middle.
`errSecInternalComponent` is a generic wrapper that tells you almost nothing, and one log line
underneath it tells you everything.

## The actual bug

Apple's intermediate certificate story: your Apple Distribution certificate is issued by the
**Apple Worldwide Developer Relations Certification Authority**, and the current one is **G3**.
The machine had exactly one WWDR certificate:

```
subject= /C=US/O=Apple Inc./OU=Apple Worldwide Developer Relations/CN=Apple Worldwide Developer Relations Certification Authority
notBefore=Feb  7 21:48:47 2013 GMT
notAfter=Feb  7 21:48:47 2023 GMT
```

```
$ security verify-cert -c wwdr.pem -p basic
Cert Verify Result: CSSMERR_TP_CERT_EXPIRED
```

The old one. Expired in February 2023. No G3 anywhere on the box. The roots were fine, the leaf was
fine, the middle of the chain was simply absent.

This also explained a warning I had been reading straight past. In *every* build, including the
passing ones, the signing tooling had said:

```
There are no local code signing identities found.
(Check in Keychain Access for an expired WWDR certificate: ...)
```

That is not noise. `security find-identity -v` only lists identities whose chain **validates**. An
identity with a broken chain is invisible to it. The tool had been telling me "your WWDR cert is
expired" in the first failing build, in plain English, with a link. I skimmed it as boilerplate for
two days.

## The second half of the bug

Fix looks obvious now: install WWDR G3. It is a free public download from Apple's certificate
authority page, and it is valid to 2030:

```
subject= /CN=Apple Worldwide Developer Relations Certification Authority/OU=G3/O=Apple Inc./C=US
issuer= /C=US/O=Apple Inc./OU=Apple Certification Authority/CN=Apple Root CA
notAfter=Feb 20 00:00:00 2030 GMT
```

So I had CI install it into the per-build keychain it already creates. Clean, self-healing, no sudo,
no hand-curated machine state. Very tidy.

It failed again. And this is the genuinely interesting part.

The G3 install ran. The log confirmed it. The certificate was in the keychain the build was signing
from. And `codesign` still reported `MissingIntermediate`, roughly twenty seconds after that
keychain had been created.

**Trust evaluation does not reliably see certificates you just added to a brand new keychain.**
There is a window. Put a cert in a keychain that is seconds old, ask `trustd` to build a chain
through it immediately, and it may not be there yet as far as trust evaluation is concerned.

Which, finally, explains the whole thing, including my beautiful timing correlation:

| What I observed | What was actually happening |
|---|---|
| First app always passes | It compiles for ~80 seconds before signing. `trustd` catches up in that window. |
| Second app always fails | It reuses the first app's warm build cache, so it reaches signing ~20 seconds after its keychain was born. |
| Short gap fails, long gap passes | Not the gap between jobs. The **duration of the build before signing**. |
| Sometimes it just works | `trustd` can fetch the missing intermediate over the network via the certificate's AIA URL and cache it. Network dependent. |
| Retrying three times still fails | Retry re-signed against the same keychain that trust evaluation was not seeing. |

Every correlation I had was a shadow of "how long did this build take before it tried to sign".

The fix that actually holds: put G3 in the **login keychain**, which is persistent, stable, always
in the search list, and has no freshness window. No sudo required:

```
security add-certificates -k ~/Library/Keychains/login.keychain-db AppleWWDRCAG3.cer
```

Verified against reality rather than vibes, by pulling the real leaf certificate out of a
successfully signed app and asking the system to evaluate the chain:

```
$ codesign -d --extract-certificates SomeApp.app
$ security verify-cert -c codesign0 -p codeSign
...certificate verification successful.
```

## What I would tell past me

**Read the hint the tool gives you.** Mine printed "check for an expired WWDR certificate" with a
link, in the first failing build. I dismissed it as generic boilerplate because it appeared in
passing builds too. That it appeared in passing builds was itself the clue: those were passing for a
*different reason* than I assumed.

**Correlation with timing is the most dangerous kind of correlation.** "Second one fails" and
"builds close together fail" were both true and both meaningless. Timing correlations feel like
mechanism because races are real and common, so your brain files it under "solved" and stops. If you
cannot name the mechanism, you have a pattern, not a diagnosis.

**When a system component fails opaquely, go read that component's log.** Not your CI log, not your
tool's log. `errSec*`, `CSSMERR_*`, and friends are wrappers over an internal error with an actual
name. On macOS the unified log has it. Two minutes with `log show` would have saved two days.

**A fix that fails cleanly is worth more than a fix that works.** The retry failing three times
identically is what finally killed the timing theory. Design experiments that can falsify your
theory, not just ones that might make the red turn green.

**Exit code 0 is not a green light.** My ACL commands all exited 0 in the failing builds. I read
that as "this part is fine" instead of "this part is irrelevant". It was evidence I was in the
wrong place entirely.

**Ephemeral keychains on CI are sharper than they look.** The pattern of creating a throwaway
keychain per build is good hygiene, and it quietly assumes everything you put in it is immediately
visible to trust evaluation. It is not. Anything needed for chain building belongs somewhere
persistent.

## The checklist

If you are staring at `errSecInternalComponent` on a Mac runner right now, in order:

1. Check your intermediate: `security find-certificate -a -c "Worldwide Developer" -Z /Library/Keychains/System.keychain`
   and any user keychain. If the only hit expires in **2023**, that is your bug.
2. Confirm it: `security verify-cert -c thatcert.pem -p basic`. `CSSMERR_TP_CERT_EXPIRED` is your answer.
3. Install **WWDR G3** from Apple's certificate authority page into the **login keychain**, not a
   temporary one.
4. If it still fails, read the real error:
   `/usr/bin/log show --start "..." --info --style compact` and grep for your signing process.
   `MissingIntermediate`, `NOT_TRUSTED`, and friends are the truth. The `errSec` code is not.
5. Only after all that should you start suspecting races.

The bug was a certificate that expired three years ago. The lesson was that I spent two days
building elaborate theories on top of a correlation while the machine was quietly printing the
answer in two different places.
