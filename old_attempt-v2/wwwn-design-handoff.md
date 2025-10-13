# WWWN Design Handoff: Core Flow, Identity Capture, and Transparency

### TL;DR

WWWN is an MVP web app that guides teams through a transparent, accountable "What's Working, What's Not" retrospective in three seamless stages—private capture, group reveal/voting, and decisive assignment—with special focus on identity capture via configurable name dropdowns, Anonymous entry toggles, and a persistent, transparent session history. It’s designed for organizations that value flow, speed, and persistent, org-wide insights with minimal friction and maximum accountability.

---

## Agent Build TODO (Phase 1)

Use this as an execution checklist for Claude/Gemini or other coding agents. Mark each item Done as you implement.

Backend/API

* Sessions: create, read, update (phase state: setup, capture, voting, assign, closed), list by org.

* Entries: create (fields: session_id, column, text, author_id, is_anonymous, created_at), update text, list private (author-only) until reveal, list all after reveal.

* Clustering: facilitator-only endpoint to generate clusters; accept/undo merges; record merge groups.

* Votes: add/remove +1; unlimited in Phase 1; compute sort order by total votes at assign phase start.

* Ownership: assign owner_id, first_task, ticket_link, eta; enforce owner + eta required.

* Locks/Timers: server-tracked timers; endpoints to open/close capture and voting; hard-lock writes on expiry.

* Auth/Identity: load config-driven name list; remember last used name; never default to Anonymous on new session.

History

GET /orgs/{id}/sessions?owner=…&tag=…&status=…&from=…&to=… Response: paginated session list (no summary counts in Phase 1).

* History: list sessions with filters (owner, theme/tag, date, status). No summary counts in Phase 1.

* Export: CSV export endpoint for session data.

* Persistence: autosave entries; durable storage; timestamps.

Frontend/UX

* Pages: Session Setup, Join/Name selection, Stage 1 Capture (two columns, per-entry Anonymous toggle), Stage 2 Reveal + unlimited +1 voting, Stage 3 Assign/Commit (modal), Session Closed (read-only + share link), History (list + filters).

* Timers/Locks: visible countdowns; disable inputs on expiry; tooltip on disabled actions.

* Clustering UI: facilitator panel to preview suggestions; accept/undo merges.

* Ownership Modal: required Owner + ETA; optional First Task + Ticket link; block Next until saved.

* Error/Empty States: lost connection banner with auto-retry; empty history message.

* Minimal Telemetry hooks for: session_created, name_selected, entry_add, entry_toggle_anon, cluster_accept, vote_add, item_assign_owner, item_set_eta, session_close, history_view_open.

Performance/SLA

* P95 <1s for reveal/sort with up to 200 items; interactions P95 <200ms.

Out of Scope (Phase 1)

* Progress banner; vote caps; integrations; small-team UI polish; deep accessibility polish; advanced resilience.

## Goals

### Business Goals

* Achieve 90%+ session completion rate within teams adopting WWWN.

* Enable org-wide retrospective visibility post-session for 100% of closed sessions.

* Ensure reveal and sort times of <1 second for up to 200 items (P95).

* Establish named ownership and ETA on 95%+ of action items.

### User Goals

* Keep participants focused and engaged, minimizing interruptions or confusion.

* Enable both accountability and psychological safety via flexible identity capture.

* Ensure every issue is transparently tracked and owned post-session.

* Provide easy access to retrospective history and progress across the org.

### Non-Goals

* Not a fully configurable retrospective toolkit—no custom columns/forms.

* No integrations with external project tools (e.g., Jira, Slack) in MVP.

* No support for non-org/guest access during MVP.

---

## User Stories

### Facilitator

* As a facilitator, I want to set timers and control phase transitions so that the session flows smoothly and maintains focus.

* As a facilitator, I want to cluster similar entries using LLM suggestions so that discussion is more efficient.

### Participant

* As a participant, I want to select my name or choose to post individual items as Anonymous so that I can contribute candidly when needed.

* As a participant, I want to submit entries quickly and vote on others’ entries, so that my input is counted.

* As a participant, I want to track my own contributions and see their impact in History.

### Viewer (Org-wide, Post-Close)

* As a viewer, I want to browse past sessions and filter action items by owner, theme, or status so that I can understand team progress.

### Admin

* As an admin, I want to configure the allowed names and enable/disable Anonymous capture so that identity policies fit my org’s needs.

* As an admin, I want to export session results as CSV and manage retention.

---

## Functional Requirements

* **Session Setup & Identity (Priority: 1)**

  * Session creation with durations for Capture/Voting.

  * Org-configured name list loads for all users.

  * Optional Anonymous toggle, per admin config.

  * Remember last-used name (never default to Anonymous).

* **Private Capture (Stage 1, Priority: 1)**

  * Two-column entry for “What’s Working” / “What’s Not.”

  * Timer visible and synced for all.

  * Per-entry Anonymous toggle.

  * Entries are private until Stage 2.

* **Reveal + Voting (Stage 2, Priority: 1)**

  * All entries displayed; real-time voting with +1 chips.

  * Phase 1: unlimited +1s per participant (no remaining-votes indicator).

  * Voting phase hard-locks at timer expiry; late attempts get tooltip.

* **Decide, Assign, Commit (Stage 3, Priority: 1)**

  * Sorted view by votes.

  * Modal for assigning named Owner (from org config), First Task, Ticket link, and ETA.

  * Marking ‘Done’ requires at least Owner + ETA.

  * Cannot advance until assignment is saved.

* **Session Close, Transparency, & History (Priority: 1)**

  * Session switches to org-wide read-only at end.

  * Share link copy and transparency policy banner.

  * Persistent session retention and read-only browsing.

  * Admin can export to CSV.

  * History filter/search by owner, theme, date, status.

* **LLM Clustering (Priority: 1)**

  * Facilitator-triggered clustering for merging duplicates prior to reveal; accept/undo merges.

---

## User Experience

**Entry Point & First-Time User Experience**

* Users access WWWN via a direct, single-page web app.

* “Create session” prominently visible; minimal distractions.

* On first access, users are prompted to pick their name from a dropdown (org-provided list); last used name remembered, but Anonymous is never default on new session.

* Admin controls: name list config, Anonymous toggle, retention/export in a dedicated admin panel.

**Core Experience**

* **Step 1: Session Setup**

  * Facilitator creates a session, sets durations for Capture and Voting, confirms org-wide sharing post-close.

  * Admin-configured name list loads; Anonymous option available if enabled.

  * System persists org config for future sessions.

* **Step 2: Identity Selection**

  * Upon joining, users select/display name from dropdown.

  * Anonymous is present if allowed; cannot default to Anonymous, but prior (non-anonymous) choice is sticky per user.

  * Selection triggers begin-session telemetry.

* **Step 3: Private Capture – Stage 1**

  * Two columns: What’s Working / What’s Not; each row has single-click Anonymous toggle and an optional Tag dropdown (deployment/process/quality/other).

  * Timer bar visible; times out after configured period (\~10m).

  * Entry rows: real-time auto-save; unsaved/edited entries indicated.

  * Late joiners can join and participate during this phase.

  * At timer end, facilitator can (optionally) run LLM clustering, view and accept/reject/undo proposed merges.

  * Confirmed clusters merge items; unmerged items stay intact.

* **Step 4: Reveal + Voting – Stage 2**

  * At unlock, all entries (grouped/clustered) are revealed to all.

  * Inline +1 chips next to each item; clicking increments vote (unlimited unless org sets a limit).

  * User can see remaining votes if vote cap is set.

  * Timer bar counts down; on timeout, all voting disables, attempts show disabled tooltip (“Voting is now closed”).

  * Late joiners are now read-only.

* **Step 5: Decide, Assign, Commit – Stage 3**

  * Entries sorted by votes, top to bottom.

  * Facilitator and team walk through each item.

  * “Assign Owner” modal: dropdown (name list), First Task (text), Ticket link (URL), ETA (date required), "Done" can’t be clicked without required owner + ETA.

  * Next item button is disabled until form completed for current item.

  * All changes auto-saved.

* **Step 6: Session Close & Transparency**

  * At end, facilitator “closes” session.

  * App switches session to read-only for the entire org; shareable link auto-copied, banner outlines transparency.

  * Session is retained indefinitely; viewable in History.

  * Admin can export CSV.

* **Step 7: History & Search**

  * Session index (History) defaults to last session; filters for owner, date, tag, status.

  * Phase 1 strictly list + filters; no summary counts or banners.

**Advanced Features & Edge Cases**

* Network hiccup: shows “Reconnecting…” overlay; auto-save to local, resume on refresh.

* Timer desync: periodic server resync; client notifies if local time is off.

* Duplicate prevention: debounced entry matching warns user on similar submissions.

* Merge/undo resolves merge conflicts gracefully.

* Late joiners: full participatory rights in Stage 1 only.

* Small team mode: condenses UI for <5 active users, single column if needed.

**UI/UX Highlights**

* Color-contrast AA rating for all text/background pairs.

* Focus rings/live regions for timers/alerts.

* All modals accessible via keyboard; ARIA roles for timers/live region updates.

* Clear error and success states inline (e.g. “Name required,” “Saved!”).

* Minimized clicks between phases; prominent, contextual microcopy.

* Reduced motion option disables transitions, uses fading only.

---

## Narrative

It’s the end of a tough quarter. Mia, a lead engineer, is determined to run a blameless, action-oriented retrospective for her squad but is fed up with the slow, cumbersome tools that either expose participants or make tracking progress impossible. With WWWN, Mia quickly creates a session, starts the timer, and watches as her teammates—some wary of speaking out, others eager for accountability—contribute their thoughts privately. The config-driven dropdown lets everyone pick their real name (never defaulting to “Anonymous”), while the per-entry Anonymous toggle allows just enough candor where it’s needed most.

As the timer ticks, everyone captures issues and wins in two neat columns, knowing their thoughts are safe until reveal. When the session unlocks, the team’s truths are out: clusters of similar items make voting fast and high-signal. Next, they assign every critical issue to a real owner (no “anonymous” passes here), attach an ETA, and link the first task—no shortcuts, no lost action items.

At close, Mia shares the results with the org; every entry, owner, and task is now visible, impossible to sweep under the rug, and trackable in the History tab with status updates and progress banners. For the first time, both candor and accountability live side-by-side. Teams like Mia’s move faster, learn more, and never repeat the same mistakes—the cycle is visible to all.

---

## Success Metrics

### User-Centric Metrics

* % sessions completed end-to-end

* % action items with owner + ETA set

* % of entries marked Anonymous

* User satisfaction (in-app NPS post-use)

### Business Metrics

* Org-wide adoption rate: sessions per team per month

* Reduction in 'stale' or un-owned action items in History

* Growth in unique org viewers accessing read-only sessions

### Technical Metrics

* Reveal/sort P95 <1s for 200 items

* In-app interaction latency P95 <200ms

* Auto-save reliability: zero data loss in simulated disconnects

### Tracking Plan

* session_created

* name_selected

* entry_add

* entry_toggle_anon

* cluster_accept

* vote_add

* item_assign_owner

* item_set_eta

* session_close

* history_view_open

* progress_banner_view

Events include timestamp, user id, session id, and relevant action metadata.

---

## Technical Considerations

### Technical Needs

* REST or GraphQL APIs for sessions, entries, votes, users, history. Every response must include `x-request-id` header; server must log it with method, path, user_id, org_id, and latency for triage.

* Real-time updates via WebSocket or polling for timers, sessions, voting.

* Config-driven name/participant lists, managed in backend.

* LLM clustering integration option for facilitator on demand.

* Resilient front-end with local storage for auto-save.

### Integration Points

* Org directory import (for name config) if available—post-MVP.

* CSV export for data portability.

### Data Storage & Privacy

* Entries are private to session users until reveal; then readable org-wide.

* PII protected in transit and at rest; Anonymous entries masked except in History where attribution is "Anonymous."

* Indefinite retention unless Admin deletes/exports.

* All access is authenticated via org SSO or secure invite link.

### Scalability & Performance

* Target: up to 200 concurrent items, <1s reveal/sort, <200ms interaction.

* Back-end and front-end cache hot items; lazy-load for History.

* Autosave and resume-on-refresh for interruptions.

### Potential Challenges

* Ensuring timer desyncs and network drops do not disrupt flow; seamless resume required.

* Entry merge conflicts (cluster/undo) need reconciliation safeguards.

* Handling simultaneous edits, votes, and merges with transactional integrity.

* Enforcing privacy: never leak non-revealed entries, or owner names on Anonymous entries.

---

## Milestones & Sequencing

### Project Estimate

* Medium: 2–4 weeks

### Team Size & Composition

* Small Team: 2 people total (1 engineer, 1 product/design hybrid)

### Suggested Phases

**Phase 1: Core Session Flow, Identity, and Clustering (1 week)**

* Key Deliverables: All main screens (setup, capture, reveal, assign, close), identity capture, timers/locks, facilitator LLM clustering (accept/undo), minimal MVP telemetry, History list + filters (no summaries). (Engineer + Product/Design)

* Dependencies: Minimal, just persistent storage and basic auth.

**Phase 2: Transparency, History, & Progress Banner (1 week)**

* Key Deliverables: Org-wide read-only post-close, share link, full History UI with filters, Progress banner (“since last WWWN”), CSV export/admin panel. (Engineer)

* Dependencies: Phase 1 complete.

**Phase 3: Performance & Edge Cases (1–2 weeks)**

* Key Deliverables: Small-team UI, accessibility polish, network/timer resilience, non-functional benchmarks/tuning, final microcopy, telemetry hardening, QA. (Engineer + Product/Design)

* Dependencies: Phase 1 & 2.

---

## Minimal API Schemas (Phase 1)

Note: These are intentionally minimal for speed; evolve as needed.

Sessions

POST /sessions { "name": "YYYY-MM Retrospective", "org_id": "org_123", "capture_seconds": 600, "voting_seconds": 600 }

GET /sessions/{id} Response includes: { id, org_id, phase: "setup|capture|voting|assign|closed", capture_seconds, voting_seconds, created_at }

PATCH /sessions/{id} { "phase": "capture|voting|assign|closed" }

Entries

POST /sessions/{id}/entries { "column": "working|not", "text": "…", "author_id": "u_123", "is_anonymous": true|false, "tag": "deployment|process|quality|other" }

PATCH /entries/{entry_id} { "text": "…", "tag": "deployment|process|quality|other" }

GET /sessions/{id}/entries

* If phase < reveal: return only caller’s entries

* If phase ≥ reveal: return all entries with { id, text, column, author_display: "Name"|"Anonymous", tag }

GET /sessions/{id}/entries

* If phase < reveal: return only caller’s entries

* If phase ≥ reveal: return all entries with { id, text, column, author_display: "Name"|"Anonymous" }

Clustering (Facilitator only)

POST /sessions/{id}/clusters/suggest { } Response: { groups: \[ { group_id, entry_ids: \[e1,e2,…\], summary: "…" } \] }

POST /sessions/{id}/clusters/accept { "group_id": "g_1", "summary": "merged text" }

POST /sessions/{id}/clusters/undo { "group_id": "g_1" }

Votes

POST /entries/{id}/votes { "delta": +1 } // unlimited in Phase 1

GET /sessions/{id}/tally Response: \[ { entry_id, votes } \]

Ownership

POST /entries/{id}/assign { "owner_id": "u_456", "first_task": "…", "ticket_link": "https://…", "eta": "2025-10-31" }

History

GET /orgs/{id}/sessions?owner=…&theme=…&status=…&from=…&to=… Response: paginated session list (no summary counts in Phase 1).

Auth/Identity

GET /orgs/{id}/names Response: \[ { id:"u_123", display:"Mia L." }, … \] plus { allow_anonymous: true|false }

## UI Placement Decisions (Phase 1)

* Clustering panel: right-side drawer for facilitators; opens after Capture timer ends; supports preview, accept, undo.

* Anonymous toggle: per-entry icon button inline with the text row; tooltip “Post this one as Anonymous.”

* Timers: pinned at the top of the session view with phase label; color shifts as time approaches zero.

* Ownership modal: centered dialog; blocks navigation to next item until Owner + ETA are saved.

* History: simple list with left-side filters; no summary counts.

## Two-Week MVP Sprint Breakdown (tied to Agent TODO)

Week 1 (Core Flow + Clustering)

* Day 1–2: Scaffolding (sessions, auth/name list, phases, timers); Session Setup, Join/Name screens.

* Day 3: Stage 1 Capture UI + autosave; per-entry Anonymous toggle.

* Day 4: Clustering endpoints + right drawer; suggest/accept/undo plumbing.

* Day 5: Stage 2 Reveal + unlimited +1 voting; tally for sort; basic telemetry hooks.

Week 2 (Assign, Close, History, Hardening)

* Day 6: Stage 3 Assign/Commit modal with validations; block-next logic.

* Day 7: Session Close → org-wide read-only; share link; CSV export endpoint.

* Day 8: History list + filters (no summaries); access controls.

* Day 9: Latency tuning for reveal/sort; tooltip on disabled actions; empty/error states.

* Day 10: Stabilization pass; minimal QA; deploy to internal dogfood.

Risks to watch

* Timer drift under spotty networks; keep server-authoritative timers.

* Clustering summarization quality; ensure easy undo and never destructive merges.

* Privacy leaks pre-reveal; verify entry scoping at API layer.

## Error Handling: Minimal JSON Patterns (Phase 1)

Use consistent error envelopes to simplify client logic.

400 Bad Request { "error": { "code": "invalid_input", "message": "ETA must be a future date.", "field": "eta" } }

401 Unauthorized { "error": { "code": "unauthorized", "message": "Login required." } }

403 Forbidden { "error": { "code": "forbidden", "message": "Facilitator role required to run clustering." } }

409 Conflict { "error": { "code": "merge_conflict", "message": "Cluster group g_1 was already applied.", "conflict_id": "g_1" } }

422 Unprocessable Entity { "error": { "code": "validation_failed", "message": "Owner and ETA are required.", "fields": \["owner_id","eta"\] } }

429 Too Many Requests { "error": { "code": "rate_limited", "message": "Please wait before submitting another vote." } }

500 Internal Server Error { "error": { "code": "server_error", "message": "Unexpected error; please retry." } }

Client display rules

* Prefer error.message for user-facing snackbars; fall back to generic copy if missing.

* If field present, highlight the field and focus it.

* Log code + request id (header `x-request-id`) for support.

## Clustering Prompt & Guardrails (Phase 1)

Invocation: Facilitator clicks “Suggest clusters” → backend calls LLM with the entries from Stage 1.

System prompt (summarized for speed) “You are assisting a retrospective facilitator. Group short text entries into clusters of similar meaning. Do not edit original texts. Propose a concise, neutral summary label for each cluster. Avoid assigning blame. Never invent entries. Return JSON only.”

User content payload { "entries": \[ { "id": "e1", "text": "Deploys are too slow on Fridays" }, { "id": "e2", "text": "Friday release pipeline takes 40m" }, { "id": "e3", "text": "Code reviews are fast" } \], "max_clusters": 12 }

Expected model output { "groups": \[ { "group_id": "g_1", "entry_ids": \["e1","e2"\], "summary": "Friday releases are slow due to pipeline duration" }, { "group_id": "g_2", "entry_ids": \["e3"\], "summary": "Code reviews pace is healthy" } \] }

Guardrails

* Human-in-the-loop: facilitator must accept each group; undo at any time.

* Non-destructive: original entries are never lost; merged view references source ids.

* Safety: strip PII before sending to the LLM when feasible; cap tokens via `max_entries` and `max_clusters`.

* Timeout: fail fast (≤5s); surface retry CTA. On failure, proceed without clustering.

* Determinism: keep temperature low (≤0.2) for stable grouping.