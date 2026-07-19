---
layout: post
title:  "Home Assistant Was Unreachable, and My Own Kubernetes Node Was the Firewall"
date:   2026-07-18 23:00:30 -0400
categories: tech
tags: [home-lab, kubernetes, proxmox, networking, home-assistant, self-hosted]
description: "Home Assistant was reachable from its own VLAN but not from my main network, even though the firewall rule for it looked fine. The real cause was hiding two layers deeper, in a Kubernetes component I'd forgotten was even in the path."
comments: false
permalink: /home-assistant-kubernetes-firewall
---

I built a fresh Home Assistant VM on one of my Proxmox boxes, gave it its own VLAN, and went to
open it from my laptop. Nothing. Not a slow load, not a certificate warning, just silence until
the connection gave up.

The annoying part wasn't that it failed. It's that everything I'd normally blame looked fine.
The rule allowing that VLAN to talk to my main network already existed. Other things living on
the same VLAN, an old server, a couple of cluster nodes, answered pings and SSH just fine from
the same laptop, at the same time. So it wasn't "the network is broken." It was this one VM,
specifically, and only from outside its own subnet.

## Ruling out the obvious suspects, one at a time

First guess: some kind of VLAN isolation. I run a [Firewalla](https://firewalla.com) as my
router, and this VM's network is literally called "Lockdown," so an isolation toggle felt like
the obvious answer, flip it, done in five minutes. There wasn't one to flip. Worse, I could
reach the other hosts already living on Lockdown just fine from the same laptop, so whatever was
happening wasn't "this network can't talk to that network."

Second guess: it's a brand new device, and Firewalla has a real feature for exactly that. New
devices get dropped into a Quarantine group until you clear them, and there's a separate
behavioral protection feature that limits what a device can do until it's been watched for a
while. Checked the device page: not in Quarantine. Read Firewalla's own documentation on that
behavioral feature because I didn't want to guess: it explicitly applies no blocking at all
during its learning phase, and even once active it only governs internet-bound traffic, not another
device on my own LAN reaching it. Ruled that out too.

At this point I'd spent longer reading dashboards than actually testing packets, which is
backwards. Time to look at what was really happening on the wire.

## The packet gets there. It just never arrives.

```
$ traceroute 192.168.75.x
 1  192.168.1.1   3.7 ms
 2  * * *
 3  * * *
```

Dies right after the gateway. Classic "something in the middle is eating it" shape. So I went to
the box hosting the VM and watched the bridge directly while pinging from my laptop:

```
17:05:38  aa:bb:cc:.. > 02:35:0d:5a:36:25  IP 192.168.1.x > 192.168.75.x: ICMP echo request
```

That's the router correctly forwarding my ping, addressed to the VM's real MAC, arriving right
on the bridge the VM sits on. Nothing wrong there. So I went inside the guest and checked its own
ICMP counters before and after sending a batch of pings from my laptop.

```
Before: InEchos 6
(five pings sent from my laptop)
After:  InEchos 6
```

Not one of them counted. I double checked the method by pinging from the host itself, same
subnet, and that one landed exactly as expected, six became eleven. So the counting was fine. The
packet was proven to reach the bridge, correctly addressed, and then it just wasn't there anymore
by the time it should have hit the guest's own network stack. Somewhere in between, on a single
Linux box I fully control, a packet with the right destination was disappearing.

## Ruling out the VM itself

My next assumption was that something about this specific VM, its guest firewall, some stale ARP
entry, a first-boot NIC quirk, was the actual cause. I went through all of it:

- Guest-side firewall rules: wide open, nothing dropping anything inbound.
- Rebooted the guest. No change.
- Fully stopped and restarted the VM, so the whole virtual NIC got torn down and recreated.
  No change.
- Changed the VM's MAC address to something brand new the router had never seen. No change.
- Added a second, completely unused IP to the same VM and tested that instead. No change.

Every one of those should have mattered if the bug lived in the VM, its address, or its identity.
None of them did. Which meant the bug wasn't in the VM at all. It was in the host.

## The test that actually moved the needle

Here's the part I should have done first instead of last: spin up something disposable on that
same host and see if it has the exact same problem. A minimal test container took under a
minute to create, no Home Assistant involved, brand new MAC, static test IP.

Same failure. Identical shape, identical dead end at the bridge. That one test told me more than
everything before it combined: this had nothing to do with Home Assistant, or VMs, or any config
on the guest side. Any workload hosted on this particular box was unreachable from outside its
own subnet. The VM I'd spent an evening chasing was never special. It was just the first thing I
happened to build there.

## Where it was actually hiding

This Proxmox box does double duty, it's also a worker node in my Kubernetes cluster (I wrote
about that setup [here](/homelab-grows-up)). That detail turned out to be the whole answer.

Kubernetes clusters run a component that manages network policy by rewriting the host's iptables
rules directly. On this box, that meant the `FORWARD` chain, the one that decides whether traffic
passing *through* the machine gets allowed or dropped, had its default policy set to DROP, filled
almost entirely with Kubernetes-specific rules for pod and service traffic.

Normally that's fine, because normal bridge traffic between VMs doesn't touch the IP-layer
firewall at all, it's handled at a lower layer. Except there's a kernel setting,
`net.bridge.bridge-nf-call-iptables`, that does the opposite of what its name might suggest you'd
want: when it's on, which is the default, bridged traffic between your VMs also gets evaluated by
that same `FORWARD` chain as if it were being routed.

```
Chain FORWARD (policy DROP 5921 packets, 2024K bytes)
    KUBE-ROUTER-FORWARD
    KUBE-PROXY-FIREWALL
    KUBE-FORWARD
    KUBE-SERVICES
```

My ping wasn't Kubernetes pod traffic, so it never matched any of those rules, and fell all the
way through to the default policy at the bottom: DROP. Silently, with nothing logged, nothing
rejected, just gone. Traffic to the host itself never went near this chain, which is why the host
was always reachable. Traffic between two other machines on the same subnet never routed through
this box at all. Only traffic that had to pass *through* this host to reach something it was
hosting hit the chain, and lost.

Two completely reasonable systems, a hypervisor bridging VM traffic and a Kubernetes network
policy controller managing the host firewall, had no idea they were stepping on each other,
because from either one's point of view it was doing exactly its job.

## The fix

One rule, inserted ahead of the Kubernetes-managed ones, that only covers traffic that both
enters and leaves through the VM bridge:

```bash
iptables -I FORWARD 1 -i vmbr0 -o vmbr0 -j ACCEPT
```

That's deliberately narrow. It doesn't touch how Kubernetes routes its own pod and service
traffic, which lives on entirely separate interfaces, it just tells the host "traffic that's
purely bridged between my VMs is none of your business." Tested it against both the disposable
container and the real VM, both came back instantly, and Home Assistant answered on the first
request.

To make sure a reboot doesn't quietly undo it, the same rule now lives in a small script under
`/etc/network/if-up.d/`, so it reapplies itself whenever the bridge interface comes up, idempotently,
before anything else gets a chance to touch that chain.

## What I'm taking from this one

The thing that made this slow wasn't the fix, it was one line. Every early theory failed the same
test: it explained why the VM couldn't be reached, but not why identical hosts one hop further
down the same wire could be reached just fine. The moment I stopped trying to explain the VM and
instead asked "does *anything* on this box have this problem," the answer arrived in about a
minute, from a container that had never even heard of Home Assistant.

If you're running Proxmox and Kubernetes on the same box, and something hosted there is
unreachable from outside its own subnet while the host itself answers fine, check
`iptables -L FORWARD -n` before you touch your router, your DHCP server, or your VM's network
config at all. Two well-behaved systems sharing one Linux kernel can still surprise you.
