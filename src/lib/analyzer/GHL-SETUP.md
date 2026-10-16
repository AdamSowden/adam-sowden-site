# Smart Site Analyzer: GHL setup (WP8)

What the site writes to GoHighLevel when an analyzer visitor enters their email, and what has to exist in GHL for the follow-up to quote their findings. Companion to `speed-to-lead/GHL-WORKFLOW-SPECS.md`.

## What the site writes

On email capture (`POST /api/analyzer/email`), once the report exists, `deliverReport` calls `syncAnalyzerContact` once per job:

| Write | Value |
|---|---|
| Contact upsert by email | source `adamsowden.com/analyzer` |
| Tags | `sl-lead`, `sl-analyzer-run`, `analyzer-run` |
| `analyzer_url` | the site analysed |
| `analyzer_band` | the public phrase: losing enquiries / not being found / just a business card / working, with money left on the table |
| `analyzer_top_finding` | the verbatim top finding plus its consequence sentence |
| `analyzer_report_url` | the full report link (unguessable token) |
| `analyzer_run_at` | ISO timestamp |
| Note on the contact | all of the above plus the three moves and the cost range when they gave numbers |

The Resend report email is the T+0 touch, exactly as the diagnostic's report email is. GHL owns everything after that.

## One-time admin in GHL

1. **Custom fields** (Settings → Custom Fields), text type, with exactly these keys: `analyzer_url`, `analyzer_band`, `analyzer_top_finding`, `analyzer_report_url`, `analyzer_run_at`. The site writes by key, so the key must match. Until they exist the field write fails quietly and the note still carries everything.
2. **SL-3 trigger change.** SL-3 ("New non-diagnostic lead → Diagnostic") fires on `sl-lead` without the diagnostic tags. Add `AND NOT sl-analyzer-run` to its trigger, otherwise analyzer leads get the "start the diagnostic" email, which is the wrong ask for someone who has just read a report on their site.
3. **SL-4, below.**
4. **SL-Stop-on-Booking** and **SL-Reply-Stop** already remove contacts from SL-1 to SL-3. Add SL-4 to both lists.
5. The booking calendar stays `vvT3ua4em90YPymNy0Lf`. The site now links to `/book?src=analyzer` from the report and `/book?src=analyzer-email` from the email, and pushes a `booking_view` GTM event with that source, plus `analyzer_book_click` on the report CTA. Attribution in GHL comes from the `analyzer-run` tag on the contact when `sl-booked` lands.

## SL-4: Analyzer run → Book

**Trigger:** Contact Tag added = `sl-analyzer-run`

1. Move opportunity → `Diagnostic Complete` (or a new `Analyzer Complete` stage if the pipeline gets one).
2. **Wait 1 day.** Send Email (T+1).
   Subject: `The thing worth fixing first on {{contact.analyzer_url}}`
   Body:
   > Hi {{contact.first_name}}. I ran the analyzer on {{contact.analyzer_url}} and the full report is in your inbox from yesterday. The thing worth fixing first: {{contact.analyzer_top_finding}} That one is where I would start, and it is the first thing we would map on a call. Twenty minutes, no pitch: https://adamsowden.com/book?src=sl4. Adam
   Then: add tag `sl-booking-sent`, move opp → `Booking Sent`.
3. **Wait 2 days.** Send Email (T+3).
   Subject: `Your site is {{contact.analyzer_band}}`
   Body:
   > Hi {{contact.first_name}}. The report said your site is {{contact.analyzer_band}}. A smart site is the same site, moved onto a build that brings people in, answers them and books them on its own. Your pages and addresses come across with it and what was holding it back gets cleaned up on the way. If you want to see what that looks like for {{contact.analyzer_url}}, grab a time here: https://adamsowden.com/book?src=sl4. Adam
4. **Wait 4 days.** Send Email (T+7, soft close).
   Subject: `Last note from me`
   Body:
   > Hi {{contact.first_name}}. I will stop here. The report for {{contact.analyzer_url}} stays at the link I sent, and the finding at the top of it does not fix itself. When you want to look at it together, my calendar is here: https://adamsowden.com/book?src=sl4. Adam
5. Add tag `sl-no-response`; move opp → `Lost`. **End.**

**Remove-from-workflow on:** `sl-booked`, `sl-opted-out`, Customer Replied.

Every body above passes the house slop scan. Keep them plain when editing in GHL: no em dashes, no "quietly", no "journey".

## Checking it worked

In GHL, open the contact: the three tags, the five fields and a note starting "Smart Site Analyzer run on". On the site, the job record carries `ghlSyncedAt` (set once) and `ghlSyncError` (the last error text, or null). A missing token shows as "neither GHL_SPEEDTOLEAD_PIT nor GHL_API_KEY is set"; a field write against a key that does not exist yet shows in `ghlSyncError` while `ghlSyncedAt` is still set, because the contact and the note were written.
