# ToDo: Junior Engineer Checklist

This checklist guides you through building the “What’s Working, What’s Not” Streamlit app. Complete each task in order and check it off when done.

---

## Chunk 1: Initialization & Environment

* [ ] **Scaffold project structure**

  * Create directories: `app/`, `app/pages/`, `app/services/`, `tests/`
  * Add `app/__init__.py` and `app/app.py`
* [ ] **Setup dependencies & README**

  * Create `requirements.txt` with: `streamlit`, `sqlalchemy`, `sqlite3`, `openai`, `python-dotenv`
  * Write `README.md` with instructions for installing and running (`pip install -r requirements.txt` & `streamlit run app/app.py`)
* [ ] **Implement config module**

  * In `app/config.py`, load environment variables using `python-dotenv`
  * Require and validate `DB_URL`, `OPENAI_API_KEY`, `SUBMISSION_DEADLINE`
  * Add `tests/test_config.py` to verify missing variables raise an error
* [ ] **Implement database module**

  * In `app/db.py`, initialize SQLAlchemy `engine`, `SessionLocal`, and `Base`
  * On startup (`app/app.py`), call `Base.metadata.create_all(engine)`
  * Add `tests/test_db.py` to check that `engine` and `SessionLocal` are set up correctly
* [ ] **Add ping endpoint**

  * In `app/app.py`, define `def ping(): return "OK"` and render it in Streamlit (e.g., `st.write(ping())`)
  * Add `tests/test_app.py` to assert `ping()` returns "OK"

---

## Chunk 2: Data Models

* [ ] **Define ORM classes**

  * In `app/models.py`, define:

    * `Entry(id, user, text, label, ts)`
    * `Topic(id, summary, ts)`
    * `EntryTopic(entry_id, topic_id)`
    * `Vote(id, user, topic_id)`
    * `Report(id, ts, owner, steps)`
* [ ] **Enforce relationships & constraints**

  * Add unique constraint: one vote per user-topic
  * Composite primary keys on mapping tables (`EntryTopic`)
* [ ] **Run auto-migrations**

  * Ensure `Base.metadata.create_all(engine)` creates all tables on startup
* [ ] **Write model tests**

  * `tests/test_models.py` verifies tables exist and constraints are enforced

---

## Chunk 3: Submission Page

* [ ] **Create submission page interface**

  * In `app/pages/submission.py`, implement `show_submission_page()`:

    * Use `st.text_area()` for feedback text
    * Use `st.radio()` for label selection (`"working"`/`"not"`)
    * Use `st.button("Submit")` to submit
* [ ] **Persist entry data**

  * On submit button click, create and commit an `Entry` record

  * After commit, display success message: `"Submitted as #<id>"`
* [ ] **Remove deadline logic**

  * Do **not** include automatic date checks; the retrospective runner will lock inputs manually
* [ ] **Write submission tests**

  * `tests/test_submission.py` to verify entries are saved correctly

---

## Chunk 4: Raw Feedback Page

* [ ] **Create raw feedback page**

  * In `app/pages/raw_feedback.py`, implement `show_raw_feedback_page()`:

    * Query all `Entry` records ordered by timestamp
    * Display with `st.dataframe()` or `st.table()` showing columns: `ID`, `User`, `Label`, `Text`, `Timestamp`
* [ ] **Write raw feedback tests**

  * `tests/test_raw_feedback.py` to verify correct ordering and content

---

## Chunk 5: Synthesis & Categorization

* [ ] **Implement synthesis service**

  * In `app/services/synthesis_service.py`, add `generate_topics(entries)`:

    * Format entries (ID, label, text) into an LLM prompt
    * Call OpenAI API with retry logic (2× on failure)
    * Parse JSON response: `[{"summary":..., "entryIds":[...]}]`
* [ ] **Persist topics & mappings**

  * Upsert `Topic` records from summaries
  * Clear existing `EntryTopic` mappings, insert new ones linking entries to topics
* [ ] **Create synthesis page interface**

  * In `app/pages/synthesis.py`, implement:

    * Button "Generate Topics" (disabled if no entries)
    * Use `st.spinner("Synthesizing...")` during LLM call
* [ ] **Write synthesis tests**

  * `tests/test_synthesis.py` mocks the OpenAI client and verifies DB writes

---

## Chunk 6: Voting

* [ ] **Implement vote service**

  * In `app/services/vote_service.py`, add:

    * `cast_vote(user, topic_id)`: idempotent insert (ignore repeats)
    * `get_vote_counts()`: return a dict of `{topic_id: count}`
* [ ] **Create voting page interface**

  * In `app/pages/voting.py`, implement:

    * List all topics with `summary` and referenced raw entry IDs
    * `st.button("Upvote")` for each topic, update vote count
    * Display live vote counts
* [ ] **Write voting tests**

  * `tests/test_voting.py` to verify one vote per user and correct tally

---

## Chunk 7: Reporting

* [ ] **Implement report service**

  * In `app/services/report_service.py`, add:

    * `generate_report(top_n)`: fetch top topics by vote count, include `entryIds`
    * `save_report(owner_steps_map)`: persist a `Report` record with owner and next-step details
* [ ] **Create report page interface**

  * In `app/pages/report.py`, implement:

    * Display top N topics (configurable)
    * For each: inputs for `owner` and `next_steps`
    * `st.download_button` to export CSV with columns: `topic_id, summary, votes, owner, next_steps`
    * On export, call `save_report(detail_map)`
* [ ] **Write reporting tests**

  * `tests/test_report.py` to verify CSV output format and DB persistence

---

> **Next:** Once all tasks are checked off, run the full app end‑to‑end to confirm seamless integration: submit feedback → view raw entries → generate topics → vote → export report.
