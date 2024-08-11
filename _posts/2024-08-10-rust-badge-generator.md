---
layout: post
title:  "From Kado to Rust: The Late-Night Coding Saga Continues"
date:   2024-08-10 20:15:29 -0500
categories: tech
comments: false
permalink: /rust-badge-generator
---

Hello code warriors and sleep-deprived parents! 👋 Remember that [Kado](https://github.com/janpreet/kado){:target="_blank" rel="noopener"} project I told you about? Well, buckle up, because the story isn't over - not by a long shot. Let's dive into the latest chapter of our late-night coding adventures!

First things first - Kado isn't finished. Oh no, we're just getting started! My wife and I have set up a whole task management system for different dimensions of Kado. We're talking a collection of Jira projects that would make a project manager weep with joy. As we speak (or as I type and you read), we're both knee-deep in shaping Kado's future. It's like our own little family startup, minus the VC funding and with 100% more toddler interruptions.

But while Kado continues to evolve in the background, I couldn't resist scratching another coding itch. Enter the GitHub Container Registry (GHCR) badge problem.

Picture this: It's been a few weeks since the initial Kado push, the house is quiet, the toddler is finally asleep (probably dreaming of ways to reorganize my cable management), and I'm back at my trusty laptop. The mission? Create a badge to show off those sweet, sweet pull counts for my Docker images on GHCR.

Now, I could have whipped up a quick script in a familiar language, but where's the fun in that? Riding the wave of learning momentum from Kado, I decided to tackle this project in Rust. Why Rust? Because apparently, I enjoy the coding equivalent of solving a Rubik's cube while blindfolded.

Night after night, I dove into the world of Rust. I wrestled with the borrow checker (which is like that one friend who always points out the spinach in your teeth - annoying but ultimately helpful). I danced with lifetimes, which made me question my own mortality at times.

But here's where things got really interesting - testing. Oh boy, testing. I must have gone through a thousand iterations trying to implement tests. It was like trying to nail jelly to a wall while the wall kept changing its mind about being a wall. In the end, I had to wave the white flag and settle for the simplest test possible. It's not perfect, but hey, it works! And let's be honest, "it works" is sometimes all you can ask for at 2 AM.

Is this badge generator as complex or ambitious as Kado? Nope. Is it probably overengineered for what it does? Most likely. But you know what? It works, and more importantly, I learned a ton in the process. I now have shiny download count badges on my GHCR-sourced repos, and a newfound respect for Rust developers everywhere.

Looking back at both Kado and this Rust adventure, I can't help but feel a sense of accomplishment. Not just because I managed to create something useful (twice!), but because I proved to myself that the learning journey never really ends. There's always a new language to explore, a new problem to solve, or a new way to display vanity metrics on your GitHub repos.

To all you parents out there still coding in the twilight hours, to the career-changers squeezing in learning time whenever you can, and to anyone pursuing their passions in the margins of life – keep at it. Your persistence is inspiring, and who knows? Maybe your late-night project will be the next big thing. Or at least a really cool badge generator.

As for me, it's back to Kado-land. There's a Jira board calling my name, and my wife's got some killer ideas for the next feature. Will I stick with Go, or will Rust tempt me to the dark side? Only time (and possibly a few more sleepless nights) will tell.

Until next time, may your code compile on the first try, may your coffee be strong, and may your toddler sleep just long enough for you to solve that one last bug.

Happy coding, and remember – whether it's Kado, Rust, or any other project, the best code is written with passion, perseverance, and maybe just a touch of sleep deprivation. 😴💻

P.S. If you're curious about the badge generator or want to see what Rust code looks like when written by a sleep-deprived parent, [check out the repo](https://github.com/janpreet/rust-badge-generator){:target="_blank" rel="noopener"}. Just don't judge the tests too harshly – remember, it was created in the witching hours, and sometimes, the simplest solution is the one that lets you get some sleep!