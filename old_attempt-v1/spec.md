# Spec: "What’s Working, What’s Not" Retrospective App

**Purpose:**
A lightweight, zero-bias retrospective tool where team members privately submit feedback on "What’s Working" and "What’s Not," an LLM clusters and summarizes themes, participants vote on themes, and top-voted items become action items. Designed as a developer-ready spec—detailed enough for junior engineers to build end-to-end.

---

## Table of Contents

1. [Tech Stack & Deployment](#tech-stack--deployment)
2. [Functional Requirements](#functional-requirements)
3. [Non-Functional Requirements](#non-functional-requirements)
4. [System Architecture](#system-architecture)
5. [API & UI Contracts](#api--ui-contracts)
6. [Data Schema & Persistence](#data-schema--persistence)
7. [LLM Integration](#llm-integration)
8. [Error Handling](#error-handling)
9. [Testing Strategy](#testing-strategy)
10. [Configuration & Environment](#configuration--environment)

---

## 1. Tech Stack & Deployment

### 1.1 Backend

* **Language/Framework:** Node.js w/ Express  (or Python Flask/FastAPI)
* **Auth:** OAuth2 via company SSO (e.g. Databricks SSO)
* **LLM Client:** OpenAI SDK v4 (gpt-4-turbo)
* **Database:** PostgreSQL (hosted, managed)
* **ORM:** Sequelize (Node) or SQLAlchemy (Python)
* **Queue:** Redis for rate-limiting and job status

### 1.2 Frontend

* **Framework:** React + TypeScript
* **State Management:** Context API or Redux
* **UI Library:** TailwindCSS + shadcn/ui for components

### 1.3 Deployment

* **Infrastructure:** Dockerized services, AWS ECS or Kubernetes
* **CI/CD:** GitHub Actions for lint, tests, build, deploy
* **Secrets:** AWS Secrets Manager or environment variables
* **Monitoring:** Sentry for errors, CloudWatch for logs

---

## 2. Functional Requirements

| ID  | Feature                  | Acceptance Criteria                                                                                      |
| --- | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| FR1 | **User Authentication**  | Users must login via company SSO before any action; unauthorized access returns 401.                     |
| FR2 | **Submit Feedback**      | Users can submit unlimited entries labeled as "Working" or "Not" before deadline; UI enforces labels.    |
| FR3 | **Deadline Enforcement** | Submissions disabled after configured timestamp; admin override via admin API endpoint.                  |
| FR4 | **LLM Synthesis**        | On admin trigger or cron, cluster entries into themes and generate summaries with representative quotes. |
| FR5 | **Voting**               | Users can thumb-up/down each theme; one vote per user per theme; UI shows toggle for raw comments.       |
| FR6 | **Follow-Up Report**     | Generate JSON/HTML report of top N themes sorted by net votes; include assignable "owner" fields.        |

---

## 3. Non-Functional Requirements

1. **Scalability**: Support 500 concurrent users; horizontal scale backend.
2. **Performance**: <200ms for submit/vote endpoints under normal load.
3. **Security**: HTTPS all endpoints; JWT validation; CORS locked to allowed origins.
4. **Maintainability**: Single-responsibility modules; documented interfaces.
5. **Observability**: Metrics on submissions, synthesis tasks, voting; alert on LLM failures.

---

## 4. System Architecture

```
┌─────────┐       ┌────────────┐       ┌─────────────┐      ┌────────────┐
│ Browser │ ⇄ API Gateway/│ Auth Module │ ⇄ ─ Database ─┐   │ LLM Service │
└─────────┘    Load Balancer      │ (Express) │      │         │   └────────────┘
                                    └────────────┘      ↓         /
                                                     Clusterer ──┘
                                                       │
                                                       ↓
                                                    Reporter
```

* **API Gateway:** Routes `/auth`, `/entries`, `/synth`, `/vote`, `/report`
* **Auth Module:** Validates JWT, exposes `req.user`
* **Submission Module:** CRUD on entries, enforces deadline
* **Synthesis Worker:** Background job via Redis queue
* **Voting Module:** Records/upserts votes
* **Reporting Module:** Aggregates votes, exports report

---

## 5. API & UI Contracts

### 5.1 Endpoints

| Method | Path                 | Request Body                       | Response                             | Auth                |              |
| ------ | -------------------- | ---------------------------------- | ------------------------------------ | ------------------- | ------------ |
| POST   | `/api/auth/login`    | `{ code: string }` (SSO code)      | `{ token: JWT }`                     | No                  |              |
| GET    | `/api/entries`       | —                                  | `[{entry_id, user_id, text, label}]` | JWT required        |              |
| POST   | `/api/entries`       | \`{ text: string, label: "working" | "not"}\`                             | `{ entry_id }`      | JWT required |
| POST   | `/api/synth`         | — (admin-only)                     | `{ taskId }` (queued)                | JWT+role            |              |
| GET    | `/api/synth/:taskId` | —                                  | `{ status, clusters: [...] }`        | JWT+role            |              |
| GET    | `/api/vote`          | —                                  | `[{cluster_id, votes, userVote?}]`   | JWT required        |              |
| POST   | `/api/vote`          | \`{ clusterId: string, vote: 1     | -1 }\`                               | `{ success: true }` | JWT required |
| GET    | `/api/report`        | `?topN=10`                         | `{ report: [...] }` (JSON or HTML)   | JWT+role            |              |

### 5.2 UI Wireframes

1. **Login Page** — SSO button
2. **Submission Page** —

   * Text area + label toggle + "Add Entry" button
   * List of own entries
   * Countdown timer to deadline
3. **Synthesis Status** (Admin) — show queued/in-progress
4. **Themes Page** —

   * List of synthesized themes with summary + sample quotes
   * Thumbs-up/down buttons + vote count
   * Toggle switch “View Raw Comments” showing table `[author, text, label]`
5. **Report Page** —

   * Sorted top themes, net votes, owner dropdown, next-step input
   * Export CSV/HTML button

---

## 6. Data Schema & Persistence

```sql
-- Users
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user'
);

-- Entries
CREATE TABLE entries (
  entry_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  text TEXT NOT NULL,
  label TEXT CHECK(label IN ('working','not')) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Clusters
CREATE TABLE clusters (
  cluster_id UUID PRIMARY KEY,
  summary TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Mapping entries to clusters
CREATE TABLE cluster_entries (
  cluster_id UUID REFERENCES clusters(cluster_id),
  entry_id UUID REFERENCES entries(entry_id),
  PRIMARY KEY(cluster_id, entry_id)
);

-- Votes
CREATE TABLE votes (
  vote_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  cluster_id UUID REFERENCES clusters(cluster_id),
  vote SMALLINT CHECK(vote IN (1,-1)),
  UNIQUE(user_id, cluster_id)
);

-- Reports
CREATE TABLE reports (
  report_id UUID PRIMARY KEY,
  generated_at TIMESTAMP DEFAULT now(),
  content JSONB NOT NULL
);
```

**Indexes:** on `entries.created_at`, `cluster_entries.cluster_id`, `votes.cluster_id`

---

## 7. LLM Integration

* **Endpoint:** `POST https://api.openai.com/v1/chat/completions`
* **Model:** `gpt-4-turbo`
* **Prompt Template:**

  ```text
  System: You are a clustering assistant.
  User: Given these labeled entries, cluster into themes.
  Entries:
  {{#each entries}}- [{{label}}] {{text}}
  {{/each}}
  Instructions: Return JSON: [{"clusterId":..., "summary":..., "entries":[entryIds]}]
  ```
* **Retry Logic:** retry 2× on 429 or 5xx with exponential backoff
* **Token Logging:** store prompt+response lengths in `synthesis_log` if debugging

---

## 8. Error Handling

| Case                        | HTTP Code | Behavior                                          | Developer Notes                            |
| --------------------------- | --------- | ------------------------------------------------- | ------------------------------------------ |
| Auth failure                | 401       | `{error: 'Unauthorized'}`                         | Redirect to login                          |
| Missing fields (validation) | 400       | `{error: 'Validation failed', details: {...}}`    | Use middleware (Joi/Zod)                   |
| Deadline passed             | 403       | `{error: 'Submission closed'}`                    | Check timestamp vs config.deadline         |
| Duplicate vote              | 200       | `{voteId: ...}` (idempotent update)               | Use upsert                                 |
| LLM error/timeout           | 502/504   | `{error: 'Synthesis failed'}` + admin alert email | Circuit breaker; push to dead-letter queue |
| DB connection failure       | 500       | `{error: 'Internal server error'}` + retry logic  | Global error handler logs to Sentry        |

All errors must include consistent `{error, message}` format.

---

## 9. Testing Strategy

1. **Unit Tests** (Jest/Pytest)

   * Submission Module: validation, deadline logic
   * Voting Module: idempotency, vote tally
   * Auth Module: JWT validation

2. **Integration Tests**

   * Simulate full flow: login → submit entries → synth → vote → report
   * Mock LLM with fixture JSON

3. **E2E Tests** (Cypress/Playwright)

   * User stories: Happy path + error states (late submission, invalid votes)

4. **Load Tests** (k6/Gatling)

   * 500 users submitting/voting concurrently

5. **CI Pipeline**

   * On PR: lint → unit tests → integration tests → build image
   * On merge to main: deploy to staging, run E2E

---

## 10. Configuration & Environment

Store as environment variables:

```
PORT=3000
DATABASE_URL=postgres://user:pass@host/db
JWT_SECRET=...
SSO_CLIENT_ID=...
SSO_CLIENT_SECRET=...
LLM_API_KEY=...
SUBMISSION_DEADLINE=2025-06-15T23:59:59Z
```

* **Config Module** loads and validates these at startup (fail fast if missing).

---

> **Next Steps for Devs**:
>
> 1. Clone repo, install dependencies.
> 2. Configure env variables.
> 3. Run migrations (`npm run migrate`).
> 4. Start backend + frontend.
> 5. Run tests.

*End of spec.md — ready for implementation!*
