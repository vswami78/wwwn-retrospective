# Blueprint: Building the “What’s Working, What’s Not” Retrospective App (Streamlit Edition)

**Perspective:** As John Ousterhout emphasizes, we aim for minimal complexity, clear module boundaries, and simple interfaces. This blueprint breaks the project into orthogonal components with atomic tasks and strong test coverage.

---

## 1. High-Level Modules

1. **config**: Loads and validates environment.
2. **db**: Initializes database engine and session.
3. **models**: Defines ORM classes.
4. **pages**: Streamlit multipage directory:

   * `submission.py`
   * `raw_feedback.py`
   * `synthesis.py`
   * `voting.py`
   * `report.py`
5. **services**: Encapsulates business logic:

   * `synthesis_service.py` (LLM calls)
   * `vote_service.py`
   * `report_service.py`
6. **tests**: One-to-one test modules per component.

Each module has a single responsibility and exposes a minimal API.

---

## 2. Development Chunks & Atomic Tasks

### Chunk 1: Project Scaffold & Environment

1. **Scaffold project structure**

   * Create directories: `/app`, `/app/pages`, `/app/services`, `/tests`.
   * Add top-level `app/__init__.py`, `app/app.py`.
2. **Dependencies & README**

   * `requirements.txt`: streamlit, sqlalchemy, sqlite3, openai, python-dotenv.
   * `README.md` with: install, `streamlit run app/app.py`.
3. **Config module**

   * `app/config.py`: load `.env`, require `DB_URL`, `OPENAI_API_KEY`, `SUBMISSION_DEADLINE`.
   * **Test**: `tests/test_config.py` ensures missing vars raise.
4. **Database module**

   * `app/db.py`: create `engine`, `SessionLocal`, `Base`; call `Base.metadata.create_all(engine)`.
   * **Test**: `tests/test_db.py` checks `engine` and `SessionLocal` exist.
5. **Ping endpoint**

   * In `app/app.py`, define `def ping(): return "OK"` and expose via Streamlit text on main page.
   * **Test**: `tests/test_app.py` asserts `ping()`.

---

### Chunk 2: Data Models

1. **Define ORM classes** in `app/models.py`:

   * `Entry(id, user, text, label, ts)`
   * `Topic(id, summary, ts)`
   * `EntryTopic(entry_id, topic_id)`
   * `Vote(id, user, topic_id)`
   * `Report(id, ts, owner, steps)`
2. **Relationships & Constraints**:

   * Unique constraints: one vote per user-topic.
   * Composite PKs on mapping tables.
3. **Auto-migrate**:

   * On startup, `db.Base.metadata.create_all(engine)`.
4. **Test**: `tests/test_models.py` verifies tables and constraints.

---

### Chunk 3: Submission Page

1. **Page interface** (`app/pages/submission.py`):

   * Function `show_submission_page()` registers via Streamlit multipage.
   * Use `st.text_area()`, `st.radio()` for label, `st.button("Submit")`.
2. **Data flow**:

   * On click: `models.Entry(...)`, session add & commit.
   * Display `"Submitted as #<id>"`.
3. **Deadline check**:

   * Compare `datetime.utcnow()` vs config.
   * Disable inputs if past deadline.
4. **Test**: `tests/test_submission.py` for pre/post-deadline behavior.

---

### Chunk 4: Raw Feedback Page

1. **Page interface** (`app/pages/raw_feedback.py`):

   * `show_raw_feedback_page()`: tables built with `st.table()` or `st.dataframe()`.
2. **Data retrieval**:

   * Query `Entry` ordered by timestamp.
3. **Read-only**: no edits.
4. **Test**: `tests/test_raw_feedback.py` ensures ordering and fields.

---

### Chunk 5: Synthesis & Categorization

1. **Service layer** (`app/services/synthesis_service.py`):

   * Function `generate_topics(entries)`:

     * Formats prompt with `id`, `label`, `text`.
     * Calls OpenAI, retries 2× on error.
     * Parses JSON: list of `{summary, entryIds}`.
2. **Persistence**:

   * Upsert `Topic`, truncate old `EntryTopic`, insert new mappings.
3. **Page interface** (`app/pages/synthesis.py`):

   * Button "Generate Topics" triggers service.
   * Use `st.spinner()` during call.
4. **Test**: `tests/test_synthesis.py` mocks OpenAI response, verifies DB state.

---

### Chunk 6: Voting Page

1. **Service layer** (`app/services/vote_service.py`):

   * `cast_vote(user, topic_id)`: idempotent insert.
   * `get_vote_counts()`: returns `{topic_id: count}`.
2. **Page interface** (`app/pages/voting.py`):

   * For each topic: show summary + entry IDs.
   * `st.button("Upvote")` calls `cast_vote`, then display updated count.
3. **Test**: `tests/test_voting.py` ensures one vote/user and count accuracy.

---

### Chunk 7: Reporting Page

1. **Service layer** (`app/services/report_service.py`):

   * `generate_report(top_n)`: fetch top topics, votes, entryIds.
   * `save_report(owner_steps_map)`: insert `Report`.
2. **Page interface** (`app/pages/report.py`):

   * Show top N with input fields `owner`, `next_steps` per topic.
   * `st.download_button` for CSV export.
3. **Test**: `tests/test_report.py` checks CSV format and DB insert.

---

## 3. Code-Generation Prompts

For each atomic task, send the following prompt (example for Chunk 1.1):

```text
# Prompt: Scaffold Streamlit Project Structure
Using spec.md, scaffold:
- Directories: app/, app/pages/, app/services/, tests/
- Files: app/app.py with ping(), app/config.py stub, requirements.txt, README.md
Include minimal boilerplate.
```

*Repeat pattern: describe target module, expected functions, minimal tests, clear next step.*

---

*With this decomposition, each step is small, testable, and builds on the previous one—maximizing clarity and maintainability.*
