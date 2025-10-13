# Blueprint: Building the “What’s Working, What’s Not” Retrospective App (Streamlit Edition)

**Perspective:** As John Ousterhout emphasizes, we aim for minimal complexity, clear module boundaries, and simple interfaces. This blueprint breaks the project into orthogonal components with atomic tasks and strong test coverage.

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
   * Add `app/__init__.py` and `app/app.py`.
2. **Dependencies & README**

   * `requirements.txt`: streamlit, sqlalchemy, sqlite3, openai, python-dotenv.
   * `README.md` with installation and run instructions (`pip install -r requirements.txt` & `streamlit run app/app.py`).
3. **Config module**

   * `app/config.py`: load `.env`, require `DB_URL`, `OPENAI_API_KEY`, `SUBMISSION_DEADLINE`.
   * **Test**: `tests/test_config.py` ensures missing vars raise.
4. **Database module**

   * `app/db.py`: create `engine`, `SessionLocal`, and `Base`; call `Base.metadata.create_all(engine)` on startup.
   * **Test**: `tests/test_db.py` checks `engine` and `SessionLocal` exist.
5. **Ping endpoint**

   * In `app/app.py`, define `def ping(): return "OK"` and render via `st.write(ping())`.
   * **Test**: `tests/test_app.py` asserts `ping()` returns "OK".

### Chunk 2: Data Models

1. **Define ORM classes** in `app/models.py`:

   * `Entry(id, user, text, label, ts)`
   * `Topic(id, summary, ts)`
   * `EntryTopic(entry_id, topic_id)`
   * `Vote(id, user, topic_id)`
   * `Report(id, ts, owner, steps)`
2. **Relationships & Constraints**:

   * Unique constraint: one vote per user-topic.
   * Composite primary keys on mapping tables.
3. **Auto-migrate**:

   * On startup, `db.Base.metadata.create_all(engine)`.
4. **Test**: `tests/test_models.py` verifies tables and constraints.

### Chunk 3: Submission Page

1. **Page interface** (`app/pages/submission.py`):

   * `show_submission_page()`: `st.text_area()`, `st.radio()` for label, `st.button("Submit")`.
2. **Persist entry data**:

   * On submit: create `Entry`, commit, display `"Submitted as #<id>"`.
3. **Remove deadline logic**:

   * No automatic date checks; runner will lock inputs manually.
4. **Test**: `tests/test_submission.py` verifies entries are saved correctly.

### Chunk 4: Raw Feedback Page

1. **Page interface** (`app/pages/raw_feedback.py`):

   * `show_raw_feedback_page()`: query all `Entry` ordered by timestamp.
   * Display via `st.dataframe()` with columns: `ID`, `User`, `Label`, `Text`, `Timestamp`.
2. **Test**: `tests/test_raw_feedback.py` ensures correct ordering and content.

### Chunk 5: Synthesis & Categorization

1. **Service layer** (`app/services/synthesis_service.py`):

   * `generate_topics(entries)`: format prompt with IDs, labels, texts; call OpenAI; retry 2×; parse JSON into `{summary, entryIds}`.
2. **Persistence**:

   * Upsert `Topic`; clear & insert `EntryTopic` mappings.
3. **Page interface** (`app/pages/synthesis.py`):

   * Button "Generate Topics" triggers service; wrap in `st.spinner("Synthesizing...")`.
4. **Test**: `tests/test_synthesis.py` mocks OpenAI and verifies DB writes.

### Chunk 6: Voting Page

1. **Service layer** (`app/services/vote_service.py`):

   * `cast_vote(user, topic_id)`: idempotent insert.
   * `get_vote_counts()`: returns dict of counts.
2. **Page interface** (`app/pages/voting.py`):

   * For each `Topic`: show summary + `entryIds`; `st.button("Upvote", key=topic_id)`; update & display count.
3. **Test**: `tests/test_voting.py` ensures idempotent votes and accurate counts.

### Chunk 7: Reporting Page

1. **Service layer** (`app/services/report_service.py`):

   * `generate_report(top_n)`: fetch top topics, votes, `entryIds`.
   * `save_report(owner_steps_map)`: insert `Report` with owner & next\_steps.
2. **Page interface** (`app/pages/report.py`):

   * Show top N topics; inputs for `owner` & `next_steps`.
   * `st.download_button("Export CSV")`: compile & export, then call `save_report()`.
3. **Test**: `tests/test_report.py` verifies CSV format & DB persistence.

---

## 3. Code-Generation Prompts

Below are **explicit** prompts for each atomic task. Each prompt describes the target files, required code, minimal tests, and the next integration step.

#### Chunk 1.1: Scaffold Project Structure

```text
# Prompt: Scaffold Streamlit Project Structure
Using spec.md, scaffold a new Python project:
- Create directories: app/, app/pages/, app/services/, tests/
- Add files: app/app.py with ping() stub, app/__init__.py
- Initialize empty app/pages and app/services folders
- Provide requirements.txt and README.md with install & run instructions
```

#### Chunk 1.2: Dependencies & README

```text
# Prompt: Add Dependencies and README
In the project root:
- Create requirements.txt listing: streamlit, sqlalchemy, sqlite3, openai, python-dotenv
- Write README.md with project description, setup (`pip install -r requirements.txt`), and run command (`streamlit run app/app.py`)
```

#### Chunk 1.3: Config Module

```text
# Prompt: Implement Config Module
In app/config.py:
- Use python-dotenv to load .env
- Validate DB_URL, OPENAI_API_KEY, SUBMISSION_DEADLINE; raise RuntimeError if missing
- Export config variables for use in other modules
- Write tests in tests/test_config.py to assert missing vars raise
```

#### Chunk 1.4: Database Module

```text
# Prompt: Implement Database Module
In app/db.py:
- Initialize SQLAlchemy engine using config.DB_URL
- Create SessionLocal and Base = declarative_base()
- In app/app.py startup, call Base.metadata.create_all(engine)
- Write tests in tests/test_db.py to verify engine and session creation
```

#### Chunk 1.5: Ping Endpoint

```text
# Prompt: Add Ping Endpoint
In app/app.py:
- Implement def ping(): return "OK"
- Use Streamlit (st.write) to display ping() on the main page
- Write tests in tests/test_app.py to assert ping() returns "OK"
```

#### Chunk 2.1: Define ORM Models

```text
# Prompt: Define ORM Models
In app/models.py:
- Define Entry, Topic, EntryTopic, Vote, Report classes with fields per spec
- Set relationships and constraints: unique vote per user-topic, composite PKs for mappings
- Write tests in tests/test_models.py to verify table definitions and constraints
```

#### Chunk 3.1: Submission Page Interface

```text
# Prompt: Implement Submission Page
In app/pages/submission.py:
- Define show_submission_page() using st.text_area and st.radio for 'working'/'not'
- Add st.button("Submit") that on click inserts Entry and st.success("Submitted as #<id>")
- Omit deadline logic; runner will lock inputs manually
- Write tests in tests/test_submission.py to verify entry creation
```

#### Chunk 4.1: Raw Feedback Page

```text
# Prompt: Implement Raw Feedback Page
In app/pages/raw_feedback.py:
- Define show_raw_feedback_page() that queries all Entry records ordered by timestamp
- Display entries in st.dataframe with columns ID, user, label, text, timestamp
- Write tests in tests/test_raw_feedback.py to verify ordering and content
```

#### Chunk 5.1: Synthesis Service

```text
# Prompt: Implement Synthesis Service
In app/services/synthesis_service.py:
- Define generate_topics(entries) to format entries into an LLM prompt
- Call OpenAI ChatCompletion with gpt-4-turbo, retry up to 2× on failure
- Parse JSON response into list of {summary, entryIds}
- Write tests in tests/test_synthesis.py mocking OpenAI client and verifying parsing
```

#### Chunk 5.2: Synthesis Page

```text
# Prompt: Implement Synthesis Page
In app/pages/synthesis.py:
- Define show_synthesis_page() with st.button("Generate Topics")
- Disable button if no entries
- On click, call generate_topics(), upsert Topic and EntryTopic records
- Wrap call in st.spinner("Synthesizing...")
- Write tests in tests/test_synthesis_page.py to simulate button click and DB updates
```

#### Chunk 6.1: Vote Service

```text
# Prompt: Implement Vote Service
In app/services/vote_service.py:
- Define cast_vote(user, topic_id): insert Vote if not exists; idempotent
- Define get_vote_counts(): query Vote table and return counts per topic
- Write tests in tests/test_vote_service.py for idempotency and count accuracy
```

#### Chunk 6.2: Voting Page

```text
# Prompt: Implement Voting Page
In app/pages/voting.py:
- Define show_voting_page(): list topics with summary and entryIds
- For each topic, add st.button("Upvote", key=topic_id) that calls cast_vote() and updates count
- Display live vote counts next to each button
- Write tests in tests/test_voting_page.py to verify UI and service integration
```

#### Chunk 7.1: Report Service

```text
# Prompt: Implement Report Service
In app/services/report_service.py:
- Define generate_report(top_n) to fetch top topics with vote counts and entryIds
- Define save_report(detail_map) to insert Report records with owner and next_steps
- Write tests in tests/test_report_service.py to verify report generation and persistence
```

#### Chunk 7.2: Report Page

```text
# Prompt: Implement Report Page
In app/pages/report.py:
- Define show_report_page(): display top N topics with summary, vote count, and entryIds
- For each topic, include st.text_input for owner and st.text_area for next_steps
- Add st.download_button("Export CSV") that compiles data and calls save_report()
- Write tests in tests/test_report_page.py to simulate export and DB persistence
```

---

*Each prompt is self-contained, specifying exactly which files to modify, functions to implement, tests to write, and the integration point for the next task.*
