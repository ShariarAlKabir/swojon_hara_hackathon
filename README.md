# Moholla-Fix — Feature Spec

**Track:** Spirit of July — Public accountability tools, undeletable archives, civic participation platforms

**One-line pitch:** A public app where people report neighborhood problems, prove them with photos, and team up to make small local issues too visible to ignore.

---

## 1. Why this app exists

Right now, if a streetlight is broken or a road floods every year, one person complains and nothing happens. Moholla-Fix lets many people report the same problem, join together around it, and build a public record that can't be quietly deleted or ignored.

It works on two levels:
- **For individuals:** a simple way to report a problem and see problems near them.
- **For communities:** a way to turn many small complaints into one loud, visible cause.

---

## 2. The Screens

### Screen 1 — Home (Map + List, one screen with a toggle)

This is the main screen. It shows every report in the city.

**Two ways to view it:**
- **Map view:** pins on a map, one per report
- **List view:** the same reports as scrollable cards

**Pin colors (status):**
- Red = just reported
- Yellow = being worked on
- Green = fixed

**Filters available in both views:**
- Category (streetlight, garbage, pothole, open manhole, flooding, other)
- Status (reported / in progress / fixed)
- Ward / area
- **"Near Me"** — sorts everything by distance from the user's current location, so someone can check what problems are close to them before heading out

**Trending marker:** reports that have gained a lot of support (see Section 4) are visually marked, e.g. a fire icon or "Trending" tag on the pin/card.

---

### Screen 2 — Submit a Report

A simple form:
- Take or upload a photo
- Location is auto-filled from GPS (user can adjust the pin if it's wrong)
- Pick a category
- Write a short description
- Submit

Once submitted, the report appears immediately on the Home screen with status "Reported."

---

### Screen 3 — Report Detail (also acts as the "Cause" page)

Tapping any pin or card opens this page. It shows:

- Photo, description, category, location, date reported
- **Status timeline:** a running history of the report. Every update gets added to this list with a photo and timestamp. Nothing on this list can be edited or deleted — only new updates get added. This is the "undeletable record" part of the app.
- **Three buttons:**
  - "Still There" — anyone can confirm the problem is still happening, with a photo
  - "Mark Fixed" — anyone can confirm it's resolved, with a photo
  - "Post an Update" — anyone can add a note about how the situation has changed, without needing to mark it fixed or unfixed (see Section 4a below)
- **Supporter count and "Add Your Voice" button** — see Section 4
- **"Organize a Cleanup" button** — see Section 5

---

### Screen 4 — Cleanup Event Page

If someone taps "Organize a Cleanup" on a report, it creates a small event page:
- Date and time
- Location (same as the report)
- Short description of the plan
- "I'll Join" button
- A visible list of how many people have joined

Nothing complicated here — no chat, no messaging, just a simple sign-up list.

---

### Screen 5 — Ward Dashboard

A simple accountability page showing:
- Total reports per ward
- Percentage resolved per ward
- Average number of days it takes for a report to get fixed
- A list of the oldest unresolved reports (the ones that have been ignored the longest)

This turns the app's data into public pressure — anyone can see which areas are being neglected.

---

## 3. Verification & Trust

To stop fake reports, duplicate voting, and people acting on problems they have nothing to do with, the app checks two things: **who someone is**, and **whether they're actually near the problem.**

### 3a. Identity check (stopping one person from acting many times)

- To take any action that counts (confirm status, add your voice, post an update, join a cleanup), a person needs a verified account
- An account requires a **phone number and an NID (National ID) number**, both unique — the system won't allow two accounts with the same phone or same NID
- **Important honesty point for the demo:** there is no public way to check an NID against the real government database — that access is only given to approved partners (the way bKash or Nagad verify identity). So for the hackathon, NID verification is simulated: we collect the NID and check it's not already used in our own database, but we don't verify it against the government's real records. This should be said plainly during the pitch, along with the real path forward: *"a production version of this app would integrate with the Election Commission's official verification system, the same way mobile banking apps do."*
- A person's identity is never shown publicly — only to the system, for verification. Everyone appears anonymously to other users (e.g. "Supporter #14")

### 3b. Relevance check (stopping people from acting on problems far from them)

- Submitting a new report already requires the reporter's live GPS location, so this is naturally tied to where they actually are
- For every other action on an existing report — confirming it's still a problem, marking it fixed, posting an update, adding your voice — the app checks the person's **live GPS location at that moment** against the report's location
- If they're too far away (e.g. more than ~2 km), the action isn't allowed
- This means only people who are actually near a problem can vote it up, confirm it, or add testimony to it — someone across the country can view a report, but can't influence it
- This also makes the "Trending" status mean something real: a report only trends because nearby, plausibly-affected people are backing it, not random engagement from anywhere

### 3c. Familiarity (acting on a problem without being there right now)

The live-location rule above solves most of the "random person from far away" problem, but it creates a smaller issue: someone who travels through a road every day for work might want to confirm or support a report later that night, from home — not just in the exact moment they're passing by. They're clearly a real stakeholder, so the app shouldn't block them just because they're not standing there at that second.

**How it works:**
- Every time someone takes a verified action (submit, confirm, update, add voice), the app already records their live location and the date, because of the relevance check above
- If a person has done this near the same spot (within a small area, e.g. 500 meters) on **at least 3 different days**, they're marked as **"Familiar"** with that area
- Once familiar with an area, they can act on any report inside it anytime, without needing to be physically there in the moment
- This costs nothing extra to build — it reuses the location and timestamp data the app is already collecting, it's just one more check before deciding whether to require live GPS

**In short:** live location proves you're there *right now*. Familiarity proves you're there *often*. Either one is enough to act on a report.

---

## 4a. Situation Updates (not just report once and forget)

A report isn't a one-time form — it's a living record. People affected by the same problem can keep posting how things are changing, not just confirm "still broken" or "fixed."

**How it works:**
- Anyone can tap "Post an Update" on a report's page
- They write a short note and can attach a photo (e.g. "Water level is rising, now knee-deep" or "Someone cleared half the garbage but it's still blocking the drain")
- This gets added to the report's timeline with a timestamp — same undeletable, append-only rule as everything else
- Updates don't change the report's status by themselves — status only changes through "Still There" or "Mark Fixed." Updates are just the story in between.

**Why this matters:** many real problems (flooding, garbage buildup, road damage after rain) change gradually over days, not instantly. A single before/after photo misses that. Letting people post updates turns each report into an evolving, honest record of what actually happened on the ground — which is useful both for residents checking in and for anyone later reviewing whether an area was neglected.

This also adds more content to the "Add Your Voice" testimony idea below — the more updates and voices a report has, the more real and hard-to-ignore it looks.

---

## 4. The "Add Your Voice" Feature (this is the core idea)

This is what makes Moholla-Fix different from a normal complaint app.

**The idea:** if 5 people all report the same flooding road separately, that's 5 weak, scattered complaints. Instead, once a report exists, other people facing the same problem can **join it** instead of filing a new one.

**How it works:**
- On a report's page, anyone can tap "Add Your Voice"
- They can optionally add a short note (e.g. "This flooded my shop twice this year")
- The supporter count goes up, and is shown publicly and grows in real time
- If a report's supporter count crosses a certain share of all reports in that ward, it gets marked as **"Trending"** — meaning it's a widely-shared problem, not just one person's complaint

**Why this matters for the pitch:** this directly mirrors what happened during the July movement — individual voices merging into something too big to ignore. It also doubles as a small archive of real testimony from affected people.

---

## 5. Organizing Action (Cleanups)

Beyond just reporting and rallying support, people can turn a report into direct action:
- Tap "Organize a Cleanup" on any report
- Set a date and short plan
- Others can tap "I'll Join"

This keeps the app from being purely a complaints box — it also enables people to solve small things themselves, without waiting on authorities, which fits the "civic participation" part of the track.

---

## 6. Feature Priority (what to build first)

| Priority | Features | Notes |
|---|---|---|
| **Must build** | Submit report, Home screen (map + list + filters), Report Detail with status timeline, Still There/Mark Fixed, Post an Update, Phone+NID signup (simulated), Geo-relevance check on actions | The app doesn't work without these |
| **Core idea — never cut** | Add Your Voice, supporter count, Trending marker | This is what makes the pitch unique |
| **Build if time allows** | Ward Dashboard, Familiarity (acting without live GPS) | Familiarity has a safe fallback: if there's no time, just require live GPS for every action (Option A) and mention familiarity as a designed-but-not-yet-built feature in the pitch |
| **Build last** | Cleanup event page | Simple enough to add last if time remains |
| **Not building this time** | Real government NID verification, SMS/OTP verification, complaint letter generator, chat/messaging | Out of scope for a 24-hour build — state this honestly in the pitch |

---

## 7. Quick Summary (for the pitch)

Moholla-Fix lets people report local problems with photo proof, verify each other's reports, and rally public support around shared issues — turning scattered individual complaints into a visible, undeletable, collective voice. It also lets people organize their own fixes instead of waiting indefinitely for authorities to act.
