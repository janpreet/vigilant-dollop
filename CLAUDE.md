# Blog post dating

When creating or editing a post in `_posts/`, always set the `date:` front matter to the actual
current real-world date and time, including a timezone offset (e.g. `date: 2026-07-15 20:55:00
-0400`). Get the real time from the shell (`date`) rather than guessing.

**Run `date` again immediately before writing the front matter, and again immediately before the
commit that publishes it** (right before `git commit`/`git push`, not reused from earlier in the
session). Do not estimate, round, or reuse a timestamp checked several tool calls or minutes
earlier, even by a few minutes, even "to be safe" by rounding forward. This site has no `future:
true` in `_config.yml`, so a post dated even slightly ahead of the real time it's built/pushed is
silently excluded from the live site by Jekyll, no error, no warning, it just doesn't appear. This
has actually happened: a post was dated ~17 minutes ahead of the real time, causing it to go
missing after being pushed to `main`, and it wasn't caught until the user asked why it wasn't
showing up.

Never use a bare date (`date: 2026-07-15`) for a new post. Jekyll sorts posts by `date`, and a bare
date is treated as midnight (00:00:00). A same-day post written in the evening but given a bare date
will sort *before* an earlier post that has an explicit time, which puts posts out of order on the
site relative to when they were actually written.

Do not backdate or future-date posts unless the user explicitly asks for a specific date.
