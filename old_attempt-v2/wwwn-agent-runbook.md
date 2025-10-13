# WWWN Agent Runbook (Phase 1)

### TL;DR

This runbook details how to build and operate an automated coding agent for WWWN Phase 1. It specifies endpoints, data models, process flow, LLM clustering, and guardrails for a repeatable, privacy-conscious, and testable session-based voting and assignment system targeting modern remote organizations. Audience: product engineers implementing real-time facilitation flows with LLM clustering/integration.

---

## Goals

### Business Goals

* Launch the WWWN facilitator experience for structured brainstorming and voting with automated clustering and assignment (Phase 1).

* Achieve ≤5s p95 API response times under load for all endpoints.

* Ensure all deployed changes pass the full acceptance test suite, with zero regression on privacy or locking.

* Maintain 100% audit/log coverage of key moderation and data actions.

### User Goals

* Easy setup, join, and participation in structured sessions ("retro" flow) within their organization.

* Confident, private capture and voting—no leaks before reveal.

* Trustworthy transparent assignment flow with clear history, export, and filters.

* Fast, seamless experience without technical complexity or manual refresh.

### Non-Goals

* Not implementing advanced analytics, custom retrospective templates, or third-party integrations.

* Not supporting mobile or desktop native apps (web-only).

* Not exposing direct LLM controls to non-facilitators or end users.

---

## User Stories

**Persona: Facilitator**

* As a facilitator, I want to create a session and define timing, so that the flow is consistent and transparent.

* As a facilitator, I want to trigger clustering after capture ends, so the AI can suggest groupings.

* As a facilitator, I want authority to accept and undo cluster proposals, so I keep control of the summary process.

* As a facilitator, I want to assign action items to owners with clear ETAs, so the session produces follow-through.

**Persona: Participant**

* As a participant, I want to join a session by name, so I can contribute easily.

* As a participant, I want to submit feedback anonymously or with my name, so I feel safe sharing.

* As a participant, I want to vote on as many items as I wish, so my opinions are fully counted.

* As a participant, I want to see the sorted results and who’s responsible for key items.

**Persona: Auditor**

* As an auditor, I want to export session data as CSV and search history by tag, so I can report outcomes and track trends.

---

## Functional Requirements

* **Session Management (Priority: Critical)**

  * Session Create: Start new session with org, phase, and durations.

  * Session Get/Patch: Retrieve/update current session; transition phases with timer enforcement.

  * Session Lock/Timing: Timer-mediated phase locking; authoritative server enforcement.

* **Identity & Participation (Priority: Critical)**

  * Name Selection: Join session and choose unique display name.

  * Anonymous Toggle: Option per entry to reveal/hide user.

* **Entry Capture & Reveal (Priority: Critical)**

  * Entry Create/Patch: Post, edit, and tag entries per session and column.

  * Entries Pre-Reveal Privacy: Block reads until reveal.

  * Inline Tagging, Anonymity, and Timestamps.

* **Facilitator LLM Clustering (Priority: High)**

  * Suggest: POST to propose groups using LLM after capture ends.

  * Accept/Undo: Facilitate curation; preserve source data.

  * PII stripping, token caps, timeouts, error handling.

* **Voting & Tally (Priority: Critical)**

  * Unlimited Vote POST: Allow unlimited per-user voting per session/entry.

  * Tally GET: Sort and display by votes on demand.

* **Assignment & Organization (Priority: High)**

  * Assign POST: Set ownership and ETA/links per item.

  * Ownership modal and ETA field.

* **Session Close & Org-Read (Priority: Critical)**

  * Close Phase: Transition session to closed/readonly.

  * History GET: Paginated, filterable access for orgs.

  * Export CSV: Downloadable, correctly-shaped export.

* **Telemetry & Observability (Priority: High)**

  * Minimum event firing, audit logging, request tracing via x-request-id.

---

## User Experience

**Entry Point & First-Time User Experience**

* Users are invited via link or join from dashboard.

* On first entry, prompted to select organization and input a unique display name.

* Optional onboarding: one-screen flow highlights privacy, phases, and anonymization.

**Core Experience**

* **Step 1:** Join or Create Session

  * Facilitator: Starts session, defines timing/phases.

  * UI: Minimal friction; clear organization UI; error if name taken.

  * Success: Session "lobby" with phase indicators.

* **Step 2:** Name & Capture Phase

  * Participants: Choose name, author or skip.

  * Enter feedback/ideas in columns ("What Went Well", "Needs Work", "Next"), toggle anonymous, optionally tag.

  * UI: Inline entry forms, visible timer to end-of-phase, toggle for anonymity per entry.

  * Error handling: Entries validated for length, basic profanity, tag list.

  * On submit, entries are not visible to others.

* **Step 3:** Clustering (Facilitator only)

  * After capture, facilitator invokes clustering via right drawer.

  * LLM groups are presented as proposed clusters for acceptance or undo.

  * Error: If clustering takes >5s, UI shows fallback/hint.

* **Step 4:** Reveal Phase & Voting

  * System reveals all entries; participants can vote on unlimited items.

  * UI: Vote "chip" or button, tallies auto-update, sort not revealed until assign.

  * All votes tracked per user.

  * Errors: Late votes/timeouts, votes on invalid items, ineffective repeat voting.

* **Step 5:** Assignment

  * Facilitator (or role): Assigns owners and ETAs, optional external tickets/links.

  * UI: Centered modal for owner selection, ETA/date picker, optional field for task/ticket.

* **Step 6:** Close & Export

  * Session closed; now org-readable but locked to edits.

  * Users see results, assignment, vote tallies.

  * Facilitator exports as CSV for audit or follow-up.

* **Step 7:** History & Filters

  * Org can browse past sessions; filter by tag, participant, or phase.

  * UI: Paginated history list, filter bar.

**Advanced Features & Edge Cases**

* Undo clustering restores all original entries and re-enables clustering.

* Spurious facilitator commands: Resilient handling to ignore or revert.

* Any API/LLM/timeout error triggers visible fallback message—no user data loss.

**UI/UX Highlights**

* Color-blind safe palettes, WCAG AA text contrast.

* Responsive layouts for full desktop and mobile web.

* Right drawer for facilitator commands; timers always pinned and visible.

* Modal for assign only blocks required fields (owner + ETA).

---

## Narrative

Remote teams often struggle to surface insights equally in large, hybrid meetings, leading to missed feedback, shallow voting, or action items with no clear follow-up. The WWWN Agent Runbook (Phase 1) provides a structured, semi-automated flow—powered by LLM clustering—for teams to capture, group, and act on feedback with rigorous privacy and auditability.

During a session, anyone can join, contribute ideas anonymously, and vote as much as they wish, resulting in an inclusive discussion. The facilitator leverages AI-driven clustering after submissions close, quickly synthesizing everyone's input for easy review. Afterwards, voting pins the most important issues, and assignments make responsibility/next steps explicit, all with a built-in audit trail.

When the session ends, results are easy to export and browse historically, ensuring learnings make an impact. This strengthens trust: privacy is strictly enforced, all phases are timed and locked, and mistakes can be rolled back instantly. For modern teams, it’s a repeatable path to higher engagement, continuous improvement, and lasting value.

---

## Success Metrics

### User-Centric Metrics

* Session and voting participation rates per org

* Average number of entries and votes per user

* User satisfaction (via post-session feedback, if enabled)

### Business Metrics

* Daily/weekly active organizations and sessions

* CSV exports initiated (proxy for engagement/reporting)

* Reduced burden on live facilitation (measured by feedback/surveys)

### Technical Metrics

* API reliability (p99 errors <1%)

* Latency SLA: all endpoints p95 ≤5s, clustering ≤10s even under load

* 100% pass on nightly acceptance tests

### Tracking Plan

* session_created

* name_selected

* entry_add/entry_toggle_anon

* cluster_accept

* vote_add

* item_assign_owner

* item_set_eta

* session_close

* history_view_open

  * All events attached: org_id, session_id, user_id, x-request-id, timestamp

---

## Technical Considerations

### Technical Needs

* Authoritative REST API: Sessions, Entries, Clusters, Votes, Assignments

* Enforced timers/locks, phase management

* LLM clustering service invoked via explicit endpoint

* Single-page web app: live timers, right-drawer actions, responsive UI

* CSV export and paginated org-wide history

### Integration Points

* LLM provider (Claude/Gemini) for clustering (invoked server-side only)

* Org identity and access management (if present)

* Audit/event logging service

### Data Storage & Privacy

* All timestamps UTC (ISO 8601)

* Entries, votes, session data partitioned by org/session

* All exposed data must be phase-appropriate (no early leaks)

* Privacy: entries unreadable prior to reveal

* Request/error logs bound to x-request-id for traceability

* CSVs generated on server, only accessible post-close

### Scalability & Performance

* Anticipated: Orgs of up to 1000 users, 250 concurrent sessions

* Each API endpoint must perform ≤5s at p95 even in busy phases (capture, reveal, vote)

* LLM clustering capped for token input; 10s hard timeout with graceful fallback

### Potential Challenges

* Preventing privacy escapes, especially during phase transitions or errors

* Locking enforcement during network disruptions

* LLM clustering timeout/failure modes and resilience

* Unique display name collisions

---

## Milestones & Sequencing

### Project Estimate

* Medium: 2–4 weeks

### Team Size & Composition

* Small Team: 2 total people (Full-stack engineer, Product/QA)

* Optionally, one acts as design owner as needed

### Suggested Phases

**1. Scaffolding & Contract Setup (Day 1–2)**

* Deliverables: Repo setup, DB schemas, initial endpoints, smoke tests

* Dependencies: None

**2. Capture Phase & Privacy (Day 3)**

* Deliverables: Entry endpoints (pre-reveal privacy), join/name UI/logic, lock scaffolding

* Dependencies: Schema, basic server auth

**3. Clustering Integration (Day 4)**

* Deliverables: Clustering endpoints (suggest/accept/undo), LLM invocation with prompt/guardrails, facilitator drawer in UI

* Dependencies: LLM API keys/config

**4. Voting & Reveal (Day 5)**

* Deliverables: Reveal logic, voting endpoints with unlimited votes, sort on assign, inline vote UI

* Dependencies: Prior phases, locking

**5. Assignment & Ownership Modal (Day 6)**

* Deliverables: Assignment endpoint, owner/ETA/ticket UI, sort logic

* Dependencies: Votes/reveal complete

**6. Close, Org Read & Export (Day 7)**

* Deliverables: Session close logic, org-level view, CSV export

* Dependencies: Assignment

**7. History, Filters, Pagination (Day 8)**

* Deliverables: History endpoint, paginated/filtered listing, frontend filtering controls

* Dependencies: Export logic

**8. Polish & Accept Tests (Day 9)**

* Deliverables: Accessibility, error states, acceptance test suite green, telemetry hooks

* Dependencies: All features merged

**9. Stabilize & Deploy (Day 10)**

* Deliverables: Full regression run, curl probe verification, release note, contingency rollback script

* Dependencies: Tests passing, code freeze

---

## Purpose & Scope

This runbook provides clear, operational instructions for an automated agent (Claude/Gemini) to build, test, and operate WWWN Phase 1. It covers API contracts, minimal data models, precise sequencing, testing requirements, clustering mechanics, and guardrails for safe, auditable, and privacy-respecting deployment in modern remote organizations.

---

## Environment & Conventions

* Monorepo: `api/` (backend), `web/` (frontend)

* JSON over HTTP; every response includes `x-request-id`

* All timestamps in UTC, ISO 8601 format

* Errors: standardized envelope with code/message

* Default LLM: temperature ≤0.2, API timeouts ≤5s

* Production pushes only if all critical locks are in place

---

## Data Model (Minimal)

---

## API Contract (Implement Exactly)

**Sessions**

* `POST /api/sessions` – Start sessionRequest: `{org_id, capture_seconds, voting_seconds}`Response: `{session_id, phase, ...}` (x-request-id)

* `GET /api/sessions/:id` – Current session stateResponse: `{session, entries, users}` (x-request-id)

* `PATCH /api/sessions/:id` – Update phase or timersRequest: `{phase, ...}`

**Entries**

* `POST /api/sessions/:id/entries`Request: `{column, text, is_anonymous, tag}`Response: `{entry_id}` (x-request-id)

* `PATCH /api/entries/:id`Request: `{text, tag, is_anonymous}`

**Clusters**

* `POST /api/sessions/:id/clusters/suggest`Request: `{}`Response: `{groups: [{summary, entry_ids}]}` (x-request-id)

* `POST /api/sessions/:id/clusters/accept`Request: `{groups: [{summary, entry_ids}]}`

* `POST /api/sessions/:id/clusters/undo`Request: `{}`

**Votes**

* `POST /api/sessions/:id/votes`Request: `{entry_id}`Response: `{success}` (x-request-id)

**Tally**

* `GET /api/sessions/:id/tally`Response: `{entries: [{entry_id, votes}]}`

**Assign**

* `POST /api/entries/:id/assign`Request: `{owner_id, eta, first_task?, ticket_link?}`

**History**

* `GET /api/sessions/history?org_id=...&page=...&tag=...`Response: `{sessions: [...], total, page}` (x-request-id)

**Names**

* `GET /api/sessions/:id/names`Response: `{users: [{user_id, display, joined_at}]}`

**Export CSV**

* `GET /api/sessions/:id/export.csv`Content-Disposition: attachment; shape matches data model.

---

**Sample Request/Response**

*Create session:* Request:POST /api/sessions`{ "org_id": "acme", "capture_seconds": 600, "voting_seconds": 300 }`

Response:Status 201`{ "session_id": "sess1", "phase": "capture", ... }`Headers: `x-request-id: abcd-123`

---

## Phase Sequencing (Strict)

---

## Server Responsibilities

* Maintain authoritative timers for all session phases; never cede to client.

* Enforce privacy and locking:

  * No entry reads until reveal.

  * No voting until reveal phase.

  * No changes after close.

* Compute and sort entries for assign phase start.

* Always include/persist x-request-id and request log.

* Telemetry firing on all critical session actions.

* Paginate org history on API.

---

## Frontend Responsibilities

* Single-page flow: setup > join/name > capture > reveal/vote > assign > closed > history.

* Right drawer for clustering actions (facilitator only).

* Inline anonymous toggle (checkbox/switch) per entry.

* Optional dropdown to tag entries.

* Pinned timers/timestamps at top of flow.

* Centered assignment modal for owner/ETA input.

* History view: paginated, filterable by tag/participant/phase.

---

## LLM Clustering Invocation

* Only called on facilitator POST after capture ends.

* Use provided prompt, guardrails: strip PII, truncate tokens if needed.

* 5s default timeout (max 10s).

* Store proposed groups, never destroy source entries.

* Acceptation/undo accessible only to facilitator.

* Errors: return fallback message, never partial state.

---

## Telemetry (Minimal Hooks)

Trigger these events with attributes (`org_id`, `session_id`, `user_id`, `timestamp`, `request_id`):

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

---

## Acceptance Tests (Must Pass)

* Timers/phase locks enforced on server (no client bypass)

* Privacy: entries indistinguishable pre-reveal, no leaks

* Clustering: facilitator scenario covers suggest, accept, undo, restores state as expected

* Unlimited voting: each user, any number of votes

* Sort-by-votes: after voting, tally correct, assignable order matches

* Assignment: owner+ETA required; incomplete = error

* Close/org-read: edits impossible after close, session now readable to org

* History: filters return correct results (by tag, phase)

* CSV: downloaded CSV matches expected export model shape and completeness

* Latency: all endpoints respond ≤5s at p95 under test load

---

## Run Commands

For all scripts: in repo root

* `yarn api:test` - Run backend tests

* `yarn api:lint` - Backend lint

* `yarn api:dev` - Backend dev server

* `yarn web:test` - Frontend tests

* `yarn web:lint` - Frontend lint

* `yarn web:dev` - Frontend dev server

* `yarn e2e:test` - End-to-end test suite

Critical probe (sample):

* `curl -i http://localhost:3000/api/sessions`

* `curl -i http://localhost:3000/api/sessions/:id/entries`

* `curl -i http://localhost:3000/api/sessions/:id/clusters/suggest`

* `curl -i http://localhost:3000/api/sessions/:id/export.csv`

---

## Rollback & Safety

* On any test failure or p95 endpoint latency >5s: revert last change, open incident log keyed to x-request-id, and halt deployment.

* Never ship API unless pre-reveal/capture/vote locks are active and provable.

* Always keep ability to revert session to last Green phase.

* No deploy without all acceptance tests passing and all critical locks enforced.