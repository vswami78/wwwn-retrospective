# WWWN PRD (Crisp)

An org-level retrospective web app that enables structured, unbiased input, rapid deduplication with LLM, prioritized voting, and mandatory owner + ETA capture before session end.

## Subheading

Designed for teams and leaders seeking transparent, action-oriented retrospectives that deliver accountability, speed, and organizational insight.

## Summary Paragraph

SEATTLE, TechNewsWire, September 15, 2024 — Today marks the launch of WWWN, a web-based retrospective platform purpose-built for organizations looking to capture authentic input, cluster and prioritize issues, and drive real follow-through. With time-boxed capture, +1 voting, and mandatory owner and ETA assignment, WWWN ensures every retrospective yields clear action items, organization-wide transparency, and continuous improvement.

## Problem Paragraph

Today, many organizations rely on shared documents like Google Docs for retrospectives, leading to bias as participants see others' input before submitting their own. The process is riddled with duplicate points, inefficient merges, and costly manual filtering. Meetings often run over time, and when they conclude, too many items lack a clear owner or deadline—undermining trust and diminishing follow-through. The current workflow lacks structure, visibility, and the confidence that outcomes will be owned and tracked.

## Solution Paragraph(s)

WWWN tackles retrospective inefficiency head-on by introducing a structured, time-boxed session flow with private input capture and LLM-powered clustering. Each participant privately submits input; when the window closes, all items are revealed simultaneously. The system leverages machine learning to suggest duplicate merges, which facilitators can swiftly accept or adjust for clarity before voting begins.

Prioritization is made frictionless with transparent +1 voting, automatically sorting top concerns. Critically, before a session ends, the facilitator must assign each prioritized item a clear owner, ticket link, and ETA—ensuring visible, personal accountability and organizational follow-through. Sessions are capped at 45–60 minutes, preventing meeting fatigue.

Once closed, sessions instantly become read-only and accessible organization-wide, reinforcing transparency. The History view aggregates all retros with filters for owner, status, and date, plus a progress banner showing recent wins and overdue actions—making progress obvious and review easy for all leaders. Operational commitments at launch: organization-wide retention is indefinite (keep forever); authentication will use the fastest viable org‑auth path (internal SSO if straightforward; otherwise lightweight org login) to avoid launch delays; identity is captured via a config‑driven dropdown (may include “Anonymous” if enabled) that remembers the user’s last selection but never defaults to Anonymous on the next session; reveal and sort operations complete in under 1 second for up to 200 items.

## Quotes & Getting Started

> “WWWN transforms retros into fast-track accountability sessions, helping teams surface ideas, agree on priorities, and, most importantly, ensure every commitment is owned and tracked to completion.” — Taylor Kim, Head of Product, WWWN

> “In the first session, we finally left with every top action assigned and a real ETA. No more unowned items sitting in a doc—WWWN gave our team new confidence we can drive real outcomes.” — Samir R., Engineering Manager

## External FAQs

Q: How long are sessions retained? A: Indefinitely. WWWN keeps all sessions forever for maximum transparency and longitudinal learning.

Q: How do users authenticate? A: Lightweight org login at launch, with internal SSO preferred if it’s the fastest path. Only org members can create, join, or view sessions during/after close. During capture, users select their display name from a config‑driven dropdown (includes “Anonymous” if enabled).

Q: How fast is reveal and prioritization? A: Reveal and sort complete in under 1 second for up to 200 items; typical sessions remain within 45–60 minutes end‑to‑end.

Q: Is participation anonymous? A: By default, no. Entries are private until reveal, then attributed. Admins can enable an optional “Anonymous” name choice in a config‑driven dropdown for capture; action‑item ownership is still attributed to a named owner.

Q: Can we review progress between retros? A: Yes. The History view and “Progress since last WWWN” banner highlight closed actions, overdue ETAs, and new tickets.

## Internal FAQs

Q: How does the name-entry dropdown behave? A: It is config‑driven per org/team. It remembers a user’s prior choice to reduce friction, except it never auto‑defaults to “Anonymous” on the next session; users must explicitly choose Anonymous each time. If Anonymous is used, author attribution on entries remains Anonymous after reveal, while action‑item ownership is still assigned to a named owner.

Q: What are the key operational commitments at launch? A: Retention: keep forever; Auth: lightweight org login (SSO if it does not delay launch); Identity: config‑driven name dropdown with optional “Anonymous”; Performance: reveal/sort <1s for up to 200 items.

Q: Any exceptions to post‑session visibility? A: No exceptions at launch; sessions are org‑visible read‑only immediately upon close.

Q: What metrics prove success? A: 100% of top‑N items have owner+ETA at close; ≥80% ETAs met or updated on time; ≥90% items show status updates by the next WWWN.