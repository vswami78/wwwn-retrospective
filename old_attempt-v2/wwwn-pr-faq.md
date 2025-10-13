# WWWN (What’s Working, What’s Not)

An org-level retrospective that ends with clear owners and ETAs.

## Subheading

For engineering and data science orgs that want unbiased, time-boxed retros without chaos—WWWN captures independent input, reveals themes, prioritizes by votes, and forces ownership before the meeting ends.

## Summary Paragraph

San Jose, Calif., Signifyd Newsroom — October 15, 2025: Today we announce WWWN, a lightweight, standalone web app for running org-level retrospectives that reliably turn discussion into action. WWWN time-boxes input, keeps contributions private until reveal, deduplicates similar ideas with LLM-driven synthesis, enforces timed voting, and requires an owner and ETA for every top issue before the meeting closes.

## Problem Paragraph

Leaders tell us retros are noisy and biased. In a shared Google Doc, people see others typing and self-censor or pile on. Free-form text creates duplicates and fragmentation. Time boxes slip because you can’t actually lock input. Discussion bounces across topics and ends without owners or dates—so nothing changes. The result is retro fatigue and declining trust.

## Solution Paragraph(s)

WWWN is a structured, three-stage retro designed for accountability.

* **Stage 1: Private Capture (≈10 minutes)**

  Contributors independently describe “What’s working” and “What’s not.” Teams can choose free‑form input or a simple “I like … / I wish …” prompt to keep entries concise. Entries are private until a timed reveal, and input locks automatically when the timer ends, eliminating bias and scope creep.

* **Stage 2: Reveal + Prioritize (≈10 minutes)**

  All entries appear at once; participants upvote the items they support during a strictly enforced voting window. To cut noise, an embedded LLM clusters duplicate or similar entries and proposes merged statements that a facilitator can approve or adjust.

* **Stage 3: Decide, Assign, Commit**

  Items are auto-sorted by votes. The group works down the prioritized list: a discussion is held for each selected item, and progress is mandatory—each one gets a named owner, a ticket is created, and a first task with a reasonable ETA. The meeting cannot proceed until ownership for each is explicitly captured.

WWWN launches as a standalone web app designed for fast team adoption. Participants simply access the web app, create or join a session, and follow timed prompts in an intuitive interface. To minimize friction, a config‑driven name dropdown is chosen once per session (admins may include an “Anonymous” option); each entry also offers a one‑click Anonymous toggle so contributors can focus on writing, voting, and discussion—not on identity management. Inputs remain private until the reveal; LLM clustering and strict locks keep retros focused and efficient. A “Progress since last WWWN” banner at the top summarizes closed items, overdue ETAs, and newly created tickets to focus discussion. When the session ends, results become read‑only and visible to everyone in the organization to maximize transparency. The platform enforces assignment and ETAs before session close to guarantee actionable outcomes.

## Quotes & Getting Started

“Retros only matter if they end in commitments,” said Swami Vaithi, Head of Signifyd AI Lab. “WWWN makes the path from insight to owner to ETA unavoidable—and painless.”

A Director in the AI Lab added, “The private capture and dedupe cut the noise. We left with named owners and action tickets in under an hour.”

Getting started is simple: visit the WWWN web app, create a new session or join an existing one, and invite your team to participate. Early access is available now to internal teams at intranet/wwwn (replace with final link).

## External FAQs

Q: What is WWWN? A: A standalone web app that runs time-boxed, private-until-reveal org retros and ensures every prioritized topic has a named owner and ETA before the session ends.

Q: Is participation anonymous? A: By default, no—inputs are private until reveal, then attributed. Admins can enable an optional “Anonymous” choice in a config‑driven name dropdown for capture; even then, action‑item ownership is assigned to a named owner to preserve accountability.

Q: Can the app actually stop edits and votes when time is up? A: Yes. The facilitator sets timers; the app hard-locks input and voting at expiry.

Q: Who can see the results after a session? A: By default, the full session becomes read‑only and visible to everyone in the organization once it ends—WWWN optimizes for transparency over secrecy.

Q: How does LLM synthesis work? A: The app clusters similar entries and proposes merged statements. Facilitators can accept or adjust before voting.

Q: Can we revisit past WWWN sessions to track progress? A: Yes. The History view shows prior sessions, owners, ETAs, and ticket status so you can verify follow‑through.

Q: What integrations ship at launch? A: Launch focuses on a great standalone experience. Jira/Linear ticket creation and Slack summaries are on the near-term roadmap.

Q: How long does a typical session take? A: About 10 minutes capture, 10 minutes +1 voting, then discussion until owners/ETAs are assigned—usually 45–60 minutes total.

Q: Where is data stored and who can access it? A: Data is stored in the WWWN app environment and visible to the entire organization after session close—no exceptions at launch; admins control retention. If Anonymous capture is enabled, author identity on entries remains Anonymous after reveal, but action‑item ownership is still attributed to a named owner. LLM usage is limited to clustering; configuration will support organization‑approved providers.

Q: Pricing and availability? A: Internal launch first; external availability and pricing to be finalized with GA.

## Internal FAQs

Q: Who is the primary customer and buyer? A: Engineering/Data Science org leaders who run cross-team retros; budget holder is typically a Director/VP.

Q: What are the success metrics? A: Within 90 days, 100% of top-N items have owners and ETAs logged; ≥80% of ETAs met or updated before due; participant satisfaction ≥4.5/5; duplicate rate reduced by ≥50% via LLM clustering; ≥60% of sessions use structured capture (“I like / I wish”) where enabled; ≥90% of action items show status updates by the next WWWN.

Q: Biggest risks and mitigations? A: Adoption/behavioral change (mitigate with facilitator prompts and enforced locks), LLM quality (human-in-the-loop merges), and meeting sprawl (strict “no owner, no move-on” rule baked into the UI).

Q: Why a standalone web app vs Google Docs? A: More control over privacy, locks, and voting; cleaner UX; easier to integrate ticketing and analytics.

Q: Configuration defaults? A: Default to free‑form capture with the option to enable the “I like / I wish” prompt per session; fixed +1 voting; timers are mandatory; post‑session visibility set to org‑wide read‑only by default (configurable by admins).

Q: History and accountability? A: The built‑in History view can filter by owner, theme, or date, and surfaces overdue ETAs; Slack/Email nudges will remind owners to update status before the next WWWN.

Q: Roadmap highlights post-launch? A: Jira/Linear ticket creation from the agenda, Slack/Teams summaries, richer synthesis (themes → proposed tasks), analytics on throughput and ETA accuracy, SSO and admin controls.

Q: What do we promise publicly? A: Every prioritized item leaves the session with a named owner and an ETA—no exceptions.

Q: Naming and positioning? A: “WWWN” is an internal code name; finalize external name and brand prior to GA.