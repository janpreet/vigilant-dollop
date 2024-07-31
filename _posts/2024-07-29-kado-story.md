---
layout: post
title:  "Kado: Weaving Infrastructure Management into Late-Night Code"
date:   2024-07-29 20:15:29 -0500
categories: tech
comments: false
permalink: /kado-story
---

Over the past month, I've dedicated my evenings to developing a project called [Kado](https://github.com/janpreet/kado){:target="_blank" rel="noopener"}. With a toddler at home, my coding sessions were limited to the quiet hours after bedtime, often extending until midnight. It's been a challenging but rewarding experience. This blog post aims to paint the story of project Kado. I also expect a follow-up post as a technical deep dive into Kado's real life operations and how I use it.

Kado was born out of a practical need in my homelab setup, as it was frustrating to constantly switch between Ansible and Terraform, and I wanted to control them both using a single YAML file.

My wife not only came up with the name "Kado" and designed its logo but also contributed several internal code terms like "beads," "relay," and "path." The "kado set" command was her suggestion as well.

Speaking of the logo, it's a perfect representation of what Kado does. The design features the word "kado" in a clean, modern font, with an artistic element emerging from the "d" - three colorful dotted lines that flow upward and outward, culminating in red, blue, and green circles. This imagery cleverly represents the concept of multiple "beads" or components merging together to form a cohesive final product or infrastructure. It's visually appealing while also conveying the tool's functionality in an abstract way.

![Kado logo](/assets/2024-07-29-kado-story/kado.png){:height="250" width="300"}

Developing Kado has been an enriching learning experience. I chose Go for this project, and I'm impressed with its capabilities. Each obstacle I encountered became an opportunity to expand my skills and knowledge. Something I wanted to point out was there was not a single challenge I found in Go which was not solvable in a straight forward way. I liked it a lot.

Some of the technical aspects I'm particularly proud of include creating a custom file extension (.kd) with its formatter, implementing comment functionality within these files, developing a custom template format with a custom parsing functions, and designing intuitive commands. Another learning experience was writing Rego for Terraform plan and Ansible playbook, is when I realized OPA is basically a json parser which uses DSL policies to generate output/ boolean decisions. 

Kado's architecture is layered and comprehensive. It starts with the main Kado commands, followed by configuration using "beads" in .kd files. The infrastructure configuration is managed in YAML, which then feeds into the Infrastructure as Code tools. Seeing this structure come together has been immensely satisfying. The *.kd file defines the beads -> beads hold IaC -> they all work together and merge to create the final infrastrcutre of your choice controlled by a config.yaml file.

A significant milestone was using this project to set up a Kubernetes cluster on a 2-node Proxmox setup for my homelab. Witnessing Ansible and Terraform working in tandem, orchestrated by Kado, was a gratifying experience. I plan to destroy and recreate the setup to document this process with a detailed guide and screenshots.

Interestingly, Kado led to the development of another project: [Kado-ai](https://pkg.go.dev/github.com/janpreet/kado-ai){:target="_blank" rel="noopener"}. This separate Go module enables AI-powered infrastructure analysis and recommendations. It's integrated with Kado and includes a ~/.kdconfig file for easy configuration. I've been using Claude locally for kado-ai Proxmox recommendations, which has been quite effective for infrastructure analysis and decision-making.

This project has become an integral part of my daily life, evolving alongside personal milestones and celebrations. It's been a constant presence, developing in the background as life progresses. Kind of like it participated in my life events by just being in my head.

Reflecting on this journey, I'm pleased with what I've accomplished. Starting from a concept, I've built it up layer by layer into a functional product. While it's required significant effort (more so because of redious late nights), the process has been genuinely enjoyable. At no point it felt like I was shooting in the dark, is how I knew this was the right project in the right direction.

Looking ahead, I'm eager to continue developing Kado. My plans include adding integrations with wider sets of IaC, writing more comprehensive documentation, creating user guides, and potentially opening it up for community contributions.

Kado represents a significant step in my professional development. Many thnaks to my wife for her creative input and support throughout this process. My gratitude extends to my entire family and to God for providing me with the opportunity and ability to bring this project to life. Their support has been instrumental in making Kado a reality, and I look forward to seeing it grow :)
