# Blog post dating

When creating or editing a post in `_posts/`, always set the `date:` front matter to the actual
current real-world date and time, including a timezone offset (e.g. `date: 2026-07-15 20:55:00
-0400`). Get the real time from the shell (`date`) rather than guessing.

Never use a bare date (`date: 2026-07-15`) for a new post. Jekyll sorts posts by `date`, and a bare
date is treated as midnight (00:00:00). A same-day post written in the evening but given a bare date
will sort *before* an earlier post that has an explicit time, which puts posts out of order on the
site relative to when they were actually written.

Do not backdate or future-date posts unless the user explicitly asks for a specific date.
