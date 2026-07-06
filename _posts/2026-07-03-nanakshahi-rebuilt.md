---
layout: post
title:  "Nanakshahi Calendar, Rebuilt from the Jantri"
date:   2026-07-03 00:30:00 -0400
categories: tech
tags: [sikh, calendar, open-source, ics, astronomy]
description: "A ground-up rebuild of my Nanakshahi calendar: dates extracted from the printed Jantri, an astronomical engine for future years, and honest labels on every date."
comments: false
permalink: /nanakshahi-rebuilt
---

Three years ago I [shared an ICS feed](/nanakshahi-calendar) so Gurpurabs would show up in our
phone calendars without a separate app. It worked, people subscribed, and I kept
[patching it](/nanakshahi-calendar-update). But the more I checked its dates against the official
Jantri, the printed calendar published from Amritsar every year, the less they agreed. This year
I stopped patching and rebuilt the whole thing from scratch. If you already subscribe at
[janpreet.com/nanakshahi](https://janpreet.com/nanakshahi), you don't need to do anything, the
same URL now serves the rebuilt feed.

### Why the old one couldn't be fixed

My original feed stood on the *2003* Nanakshahi calendar: a tidy arithmetic design where every
month starts on the same Gregorian date each year. The problem is that the Jantri as actually
printed hasn't followed that design for over a decade, it reverted to the Bikrami system under
Nanakshahi labels. Concretely:

- **Month starts are sankrantis**, real astronomical moments, so month lengths change every
  year. Jeth had *32 days* in NS 557; in NS 558 it's Sawan that gets 32. A fixed table can't
  represent that.
- **Every Guru parkash, gurgaddi and joti-jot day moves on a Bikrami tithi.** Parkash Guru Nanak
  Dev Ji is Katak purnmashi, 5 Nov 2025, then 24 Nov 2026. Shaheedi Guru Arjan Dev Ji is Jeth
  sudi 4. None of these sit still in either the Nanakshahi *or* the Gregorian calendar.

So any feed built on fixed dates, mine included, drifts wrong within a year or two. For a
calendar people actually plan around, that's not a bug to patch; it's the wrong foundation.

### What the rebuild does

**1. The printed Jantri is the ground truth.** I extracted three published years, NS 549
(2017-18), 557 (2025-26) and 558 (2026-27), page by page, digit by digit. The PDFs have no text
layer, and Gurmukhi numerals have cruel look-alikes (੨/੭, ੫/੬/੯, ੮/੯, an earlier misread of
exactly this kind is how my old data went bad), so every date was verified at high zoom against
the day-grid numbers, which are arithmetically forced. Each date in the feed carries its source,
down to the page.

**2. An astronomical engine fills in every other year.** Under the pinned data sits a proper
drik computation, sidereal sun for sangrands, sunrise tithis at Amritsar for the lunar dates,
adhik months, kshaya/vridhi tithis, even the pradosh and aparahna rules for Bandi Chhor Divas and
Dussehra. Calibrated against every single extracted data point, it reproduces **36/36 sangrands
and 132/132 tithi dates** across the three pinned years. That means the feed already contains NS
559, 560 and beyond, no waiting for anyone to type next year in.

**3. Honesty about which is which.** Dates confirmed by a published Jantri appear normally; dates
computed for years with no Jantri yet are prefixed with **≈** and say so in their description.
When the new Jantri comes out each spring, pinning it takes about fifteen minutes, and that
year's ≈ marks disappear. A few observances that the Jantri itself moves around unpredictably are
never guessed at all, they only appear once printed.

### What you get

- **The feed** (same URL as always): [janpreet.com/nanakshahi](https://janpreet.com/nanakshahi), 
  Gurpurabs, itihasik dihade, bhagat sahiban de dihade, sangrands, massia/purnmashi, and daily
  Nanakshahi dates, in Punjabi and English. Rebuilt from source by CI on every change and monthly
  on a schedule.
- **A web calendar**: [janpreet.github.io/nanakshahi-ical](https://janpreet.github.io/nanakshahi-ical/), 
  browse any year month by month, with confirmed/estimated badges on every event.
- **An interactive explainer**: [How a Jantri Date Is Made](/sikhi/jantri-explained/), watch the
  sankranti and tithi computations described above derive real dates, live in your browser.
- **A reusable engine**: the calendar logic now lives in its own package,
  [nanakshahi-jantri](https://github.com/janpreet/nanakshahi-jantri)
  (`npm install nanakshahi-jantri`), so you can build your own things on it, widgets, bots,
  gurdwara displays. The [ICS project](https://github.com/janpreet/nanakshahi-ical) is now just a
  thin consumer of it.

### Subscribing (if you haven't already)

**Google Calendar**: Other calendars → From URL → paste
[janpreet.com/nanakshahi](https://janpreet.com/nanakshahi).

**Apple Calendar / iPhone**: Settings → Apps → Calendar → Calendar Accounts → Add Account → Other → Add
Subscribed Calendar → paste the same URL.

My earlier posts credited the [nanakshahi-js](https://github.com/Sarabveer/nanakshahi-js)
library, which faithfully implements the original 2003 calendar, it served this project well,
and the parting is purely because the printed Jantri went a different way. This rebuild follows
the Jantri, wherever it goes: when the math can predict it, it does; when only Amritsar can say,
the feed says so too.

ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖ਼ਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫ਼ਤਿਹ। Feedback and corrections welcome, especially if you
have older printed Jantris lying around; every extra year makes the engine's calibration stronger.
