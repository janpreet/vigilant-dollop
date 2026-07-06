---
layout: post
title:  "The Homelab Grows Up: Proxmox, k3s, and Real GitOps"
date:   2026-07-03 00:45:00 -0400
categories: tech
tags: [home-lab, kubernetes, proxmox, gitops, self-hosted]
description: "Moving my homelab from Docker containers running on the hypervisor to a k3s cluster with Gitea, ArgoCD, sealed secrets, and automated dependency updates, and every gotcha along the way."
comments: false
permalink: /homelab-grows-up
---

Two years ago I wrote about [my home network journey](/home-network), VLANs, MoCA, Firewalla, the
physical foundations. This post is about what runs *on* that network, because this summer the
software side finally grew up: from Docker containers running directly on the hypervisor to a
Kubernetes cluster where every change flows through git.

## The starting sin

My homelab ran as a pile of Docker containers... on the Proxmox host itself. If you know, you
know: the hypervisor is supposed to be a boring, stable layer that does nothing but host guests.
Mine was also running a dozen app containers, a monitoring stack, and a cron job that
auto-restarted anything unhealthy. No isolation between the apps and the thing that owns every VM.
It worked, which is the most dangerous state for an anti-pattern, until an OS upgrade or one bad
container takes the whole box, and everything on it, down with it.

## The new shape

Two Proxmox nodes, and a three-node [k3s](https://k3s.io) cluster on top:

- a **control-plane VM** and a **worker VM** on one Proxmox node,
- the **second Proxmox node doubling as a k3s worker**, the same machine that used to run all
  the Docker containers now just runs a kubelet.

Everything that was a Docker container is now a Deployment, migrated app-by-app with data intact.
Two deliberate exceptions taught me the most:

- **SQLite apps and NFS don't mix.** Most self-hosted apps keep their state in SQLite, and SQLite
  over NFS is a recipe for locking pain. Those PVCs use k3s's `local-path` storage on the node
  instead, with the NAS reserved for bulk data and things that genuinely need shared access.
- **One app needs the iGPU** for hardware transcoding. Passing a GPU through to k8s wasn't worth
  the ceremony for a single app, so it lives in a **privileged LXC container** on Proxmox with
  `/dev/dri` mapped in, running plain Docker. A nested-Docker-in-LXC AppArmor quirk (a `sysctl`
  it's not allowed to set) is neatly sidestepped with host networking. Right tool, right place, 
  not everything has to be Kubernetes.
- **Home Assistant** stays in its own appliance VM, untouched. Some things are perfect as they are.

Monitoring moved into the cluster too: kube-prometheus-stack and Loki via Helm, ~28 dashboards
auto-provisioned, Alertmanager pushing straight to a Discord channel. The old hand-rolled
Prometheus/Grafana/cAdvisor Docker stack is gone.

## HTTPS everywhere, without exposing anything

Every service now sits behind k3s's bundled Traefik with a **wildcard Let's Encrypt certificate**
issued by cert-manager over a DNS-01 challenge, no port-forwarding, nothing reachable from the
internet, and no browser warnings inside the house. Three things bit me on the way:

1. **Cloudflare rewrites DNS-only A records that point at private IPs to `0.0.0.0`** for public
   queries. Perfectly reasonable of them, thoroughly confusing at 11pm. Internal resolution now
   happens at the router (Firewalla's custom DNS rules cover a whole domain with one entry), and
   public DNS knows nothing about my services. Related hygiene: a wildcard cert means individual
   service names never appear in Certificate Transparency logs, worth checking if you run
   per-service certs at home.
2. **k3s ships Traefik with `allowCrossNamespace: false`.** My IngressRoutes live in one
   namespace and reference services in others; that's blocked by default and silently so. One
   `HelmChartConfig` flips it, a deliberate security default I'm consciously turning off in a
   single-tenant cluster.
3. **Traefik v3 changed `HostRegexp` syntax**, v2-style `{name:pattern}` captures are gone,
   it's plain Go regex now. Every migration guide I found still showed the old form.

## The part I'm actually proud of: GitOps that isn't aspirational

The real upgrade isn't the cluster, it's that **nothing changes on it by hand anymore**:

- **Gitea**, self-hosted in the cluster (private repos, NFS-backed so history survives a full
  cluster rebuild), holds two repos: one for infra documentation, one with every live Kubernetes
  manifest, Helm apps captured as chart + version + values, not dumped YAML.
- **ArgoCD** runs an app-of-apps: a `root` Application watches the applications directory itself,
  so adding a new app is a git push, not a `kubectl apply`. All fourteen Applications sync
  automatically with prune and self-heal, if I `kubectl edit` something live, ArgoCD politely
  puts it back. Git is the only durable way to change anything now.
- **The approval gate is the pull request**, not a sync button. **Renovate** runs nightly inside
  the cluster, scanning the manifests repo and opening PRs for Helm chart updates against my own
  Gitea, reviewing a diff over coffee, merging, and watching the cluster converge a few seconds
  later genuinely never gets old.
- **Secrets live in git too, sealed.** Bitnami's sealed-secrets encrypts them so only the
  in-cluster controller can decrypt; the repo alone can rebuild the whole cluster, and nothing
  sensitive is readable in it. This replaced a brittle setup where two values existed only as CLI
  overrides, which a routine `kubectl apply` silently wiped, twice, before I learned the lesson.
- **Trivy-operator** continuously scans every running image and feeds findings into Prometheus;
  a rule alerts to Discord on new CRITICAL CVEs. Its first run found 163 of them across nine
  images, including in the freshly-deployed ArgoCD and Renovate themselves. Humbling.

## Gotchas worth stealing

A few more that cost me an evening each, in case they save you one:

- **ArgoCD defaults the Helm release name to the Application name.** If you're adopting an
  *existing* Helm release, set `helm.releaseName` explicitly or ArgoCD will happily render a
  second copy of everything alongside the first. `Health: Missing` before first sync is the tell.
- **Two Grafana datasources both marked default = crash loop.** The Loki chart sets
  `isDefault: true` and so does kube-prometheus-stack's Prometheus. Grafana refuses to start.
  One values-file line fixes it.
- **kube-prometheus-stack's Services expose an internal reloader port on 8080**, as a
  LoadBalancer in k3s (which uses hostPorts) that collides with anything else wanting 8080,
  cluster-wide.
- **Its CRDs are also too big for client-side apply**, Kubernetes' 262KB annotation limit.
  `ServerSideApply=true` in the Application's sync options and it's gone.

## What's next

Pinning the remaining `:latest` image tags so Renovate can track them, migrating the last few
pre-GitOps secrets to sealed-secrets, and tightening the handful of services still exposed as
LoadBalancers instead of going through the ingress. The list never ends, that's rather the point
of a homelab.

Most of this migration was done in long pair-programming sessions with an AI assistant driving
`kubectl` while I made the calls, a workflow that deserves its own post someday. The short
version: it turns "I'll modernize the homelab eventually" into a weekend.
