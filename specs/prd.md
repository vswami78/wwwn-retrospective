# WWWN PRD — “I Like / I Wish” Board

**Doc purpose**: Define a simple, low-friction web app to collect and reveal short-form feedback during live sessions (≈1 hour, quarterly cadence), modeled on the Coda ritual UI (“I like… / I wish…”), with clap reactions and a facilitator-controlled reveal.

**Status**: Draft for sign‑off
**Owner**: Swami (+ builder)
**Version target**: v1.0 (multi-user, ephemeral board)
**Out of scope for v1**: accounts/auth, complex moderation, deep analytics

---

## 1) Problem & Goals

Teams need a fast, psychologically safe way to gather lightweight feedback during a workshop without bikeshedding. The tool must work on any device, require no login, cost almost nothing, and be operable by a single facilitator.

### Goals (ranked)

1. **Frictionless capture**: Anyone with the link can add feedback in seconds; no sign-in.
2. **Facilitator “Gate→Reveal”**: Hide ideas during capture; reveal them all at once.
3. **Real-time visibility**: New rows and claps appear live for all viewers.
4. **Simple reactions**: Per-item **Clap** counter.
5. **Search & skim**: Basic search across idea text and author.
6. **Persistence (short-lived)**: Board content survives page reloads; TTL cleanup automatically.
7. **Easy export**: CSV export at end of session.

### Non-goals (v1)

* Accounts, SSO, roles beyond **Facilitator** vs **Participant** (anonymous).
* Threaded comments, nested replies, or clustering.
* Long-term knowledge management; this is a **temporary session tool**.
* Offline multi-device sync.

---

## 2) Users & Key Scenarios

**Facilitator** runs the session, creates the board, toggles **Reveal**, exports CSV.
**Participants** open a link, add short items, clap after reveal.

Scenarios:

* F1: Create board on projector, toggle **Gate** (on by default), share link/QR.
* P1: Participant opens link, submits 3–5 items quickly.
* F2: Facilitator hits **Reveal**, team skims, claps, discusses top items.
* F3: Export CSV and optionally purge board.

---

## 3) UX Requirements (MVP v1)

### 3.1 Main screen (board)

* **Header**: `☑ Check to view all answers once everyone is finished adding feedback`

  * Label text matches screenshot tone.
  * If checked (default), **Idea** column shows placeholder “Hidden until reveal” for non-facilitators until reveal.
* **Table columns**: `Starter | Idea | Who | Clap`

  * **Starter**: pill with two values: **I like…** (green), **I wish…** (purple).
  * **Idea**: short text (<= 200 chars).
  * **Who**: free text name; show small avatar circle with initials.
  * **Clap**: button `👏` with count.
* **Row actions**: none for participants; facilitator can delete rows.
* **Search box** (top-right): filters by **Idea** and **Who**.
* **Sentence starters** (bottom-left): two chips to quick-seed input with **I like…** or **I wish…**.

### 3.2 Composer

* Inputs: **Starter** (select), **Idea** (text), **Who** (text).
* **Add** button; Enter submits if Idea has text.
* On submit: clear Idea; keep last **Who**.

### 3.3 Gate → Reveal behavior

* While **Gate ON & Not Revealed**:

  * Ideas are **masked** for all **participants**.
  * Facilitator can view unmasked (toggle “Preview as participant”).
  * Claps are **disabled** until reveal.
* On **Reveal**:

  * All ideas unmask in real time.
  * Clapping enabled for everyone.
* Toggling back to **Hide** re-masks ideas (allowed for corrections).

### 3.4 Export / End of session

* **Export CSV**: all rows with fields below.
* **Clear board** (facilitator only): irreversible confirmation.

### 3.5 Accessibility & polish

* Keyboard-first (Tab order, Enter to submit, Space to clap).
* Visible focus rings; sufficient color contrast on dark theme.
* ARIA labels on interactive controls.

---

## 4) Data Model

### 4.1 Entities

**Board**

* `id` (string, 8–10 chars)
* `createdAt` (ts)
* `revealed` (bool, default false)
* `gateEnabled` (bool, default true)
* `ttlAt` (ts; auto-delete after N days, default 7)

**Item**

* `id` (string)
* `boardId` (string)
* `starter` (enum: "like" | "wish")
* `idea` (string, 1–200)
* `who` (string, 1–60)
* `claps` (int >= 0, server-computed)
* `createdAt` (ts)

**Clap** (optional if we need per-user uniqueness)

* `id`, `boardId`, `itemId`, `clientId`, `createdAt`

### 4.2 Client identity (no login)

* Generate anonymous `clientId` per browser (UUID in localStorage).
* Enforce **1 clap per client per item** (toggleable).
* Rate-limit item creation per client (e.g., ≤ 60/min).

---

## 5) System Design (recommended, cost ≈ $0)

* **Frontend**: React + Tailwind SPA.
* **Backend**: One endpoint set (Cloud Run / FastAPI/Node):

  * `POST /boards` → create board
  * `GET /boards/:id` → board metadata
  * `POST /boards/:id/items` → add item
  * `GET /boards/:id/items?since=` → list stream (poll or SSE)
  * `POST /boards/:id/items/:itemId/clap` → clap
  * `POST /boards/:id/reveal` → toggle reveal (facilitator only)
  * `GET /boards/:id/export.csv` → CSV
* **Real-time**: Server‑Sent Events (SSE) or 1s polling; WebSockets optional later.
* **Storage**: Firestore (native TTL) or Supabase/Postgres; either <$1/mo at this usage.
* **Ephemeral security**: board `id` is unguessable (10‑char base58). Optional 4‑digit **room code** gating writes.
* **Hosting**: Cloud Run `--min-instances=0` (static + API in one or split).
* **Cost**: ~free for one hour/quarter.

**Note**: An even simpler **v0** can be single-device (no backend) using localStorage only; useful for dry-runs but not multi-user.

---

## 6) Permissions & Roles

* **Facilitator** (creator link with secret token in URL hash):

  * Toggle Reveal/Hide, Delete item, Export CSV, Clear board.
* **Participant** (plain share link):

  * Add items, Clap after reveal, Search.

---

## 7) Error Handling & Edge Cases

* Network loss during capture → queue submissions locally; retry with backoff.
* Duplicate submissions on retry → idempotency via client‑generated `id`.
* Abuse control → length limits, per‑client rate limit, optional room code.
* Facilitation recovery → if facilitator closes tab, any facilitator‑link can resume control.
* Reveal race → reveal is last‑write‑wins; SSE broadcasts authoritative state.
* Clock skew → server timestamps are source of truth.

---

## 8) Performance Targets

* P50 add‑item latency < 300 ms in-session (same region).
* P50 clap latency < 250 ms.
* Support up to **100 concurrent participants**, **≤ 500 items**, claps bursty (10/s) without collapse.

---

## 9) Privacy, Security, Compliance

* No authentication; only pseudonymous names.
* No PII required; discourage emails/phones in **Who**.
* Data auto‑expires via TTL (default 7 days; configurable).
* Export CSV is a direct download; facilitator responsible for retention.
* All endpoints behind basic bot protection (rate limiting, CORS allowlist by board).

---

## 10) Telemetry & Ops

* Minimal metrics: boards created, items added, reveal time, claps total.
* Error rate, latency percentiles.
* Log board id only; no IPs in logs (or redact).
* Healthcheck endpoint for Cloud Run.

---

## 11) Rollout Plan

1. **v0 (internal dry run)**: single-device only (localStorage).
2. **v1 (MVP, multi-user)**: Firestore/Supabase + SSE; CSV export.
3. **v1.1**: per-client clap uniqueness; soft moderation (hide item).
4. **v1.2**: Sort by claps; simple clusters (later).

---

## 12) Acceptance Criteria (v1)

* AC1: As a facilitator, I can **create** a board and share a link/QR.
* AC2: With **Gate ON**, participants’ **Idea** text is **masked** for all participants; facilitator can reveal.
* AC3: On **Reveal**, all clients show full text within **≤ 1s**; **Clap** becomes enabled.
* AC4: New items/claps reflect across clients in **≤ 1s**.
* AC5: Search filters rows by Idea/Who on the client.
* AC6: Export produces a CSV with columns: `starter,idea,who,claps,createdAt`.
* AC7: Board auto-expires after TTL (verify via API; returns 410 Gone after purge).
* AC8: No login required; app loads on mobile & desktop; keyboard accessible.

---

## 13) Open Questions

1. Should claps be **one per participant** or unlimited? (Default proposal: one per participant per item.)
2. Desired TTL (24h, 7 days)? Default here is 7 days.
3. Do we need **room code** for write access to prevent drive‑by spam?
4. CSV fields—include `itemId` and `boardId` for audit?
5. Any need to redact emojis or limit them in **Idea** field?

---

## 14) Implementation Notes (suggested stack)

* **Frontend**: React + Vite + Tailwind; deploy static via Cloud Run or Vercel.
* **Backend**: Node (Express/Fastify) or Python (FastAPI) on Cloud Run; Firestore for storage & TTL; SSE for realtime.
* **Infra defaults**: `--min-instances=0`, region `us-west1`, public unauthenticated.
* **Cost**: ≈ $0 for quarterly 1‑hour sessions.

---

## 15) Wireframe (reference)

* Matches the screenshot: top gate checkbox; table with 4 columns; right search box; bottom sentence starters; clap pill at right.

---

## 16) Definition of Done

* All acceptance criteria pass.
* CI build + basic lint/test.
* Runbook: create board → share link/QR → collect → reveal → export → clear.
* Post‑mortem template for session feedback (how did the tool perform?).

