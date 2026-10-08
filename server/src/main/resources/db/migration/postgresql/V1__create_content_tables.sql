CREATE TABLE journal_entries (
    id BIGSERIAL PRIMARY KEY,
    entry_date DATE NOT NULL,
    body TEXT NOT NULL,
    comfort_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE journal_entry_emotions (
    id BIGSERIAL PRIMARY KEY,
    journal_entry_id BIGINT NOT NULL,
    emotion_id VARCHAR(255) NOT NULL,
    label VARCHAR(255) NOT NULL,
    sort_order INTEGER NOT NULL,
    CONSTRAINT fk_journal_entry_emotions_entry
        FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
);

CREATE TABLE screening_sessions (
    id BIGSERIAL PRIMARY KEY,
    completed_date DATE NOT NULL,
    public_summary TEXT NOT NULL,
    public_comfort_message TEXT NOT NULL,
    recommended_rescreen_at DATE NOT NULL,
    requires_safety_prompt BOOLEAN NOT NULL,
    internal_subtype VARCHAR(255) NOT NULL,
    internal_chronicity VARCHAR(255) NOT NULL
);

CREATE TABLE screening_recommended_actions (
    id BIGSERIAL PRIMARY KEY,
    screening_session_id BIGINT NOT NULL,
    action TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    CONSTRAINT fk_screening_actions_session
        FOREIGN KEY (screening_session_id) REFERENCES screening_sessions(id) ON DELETE CASCADE
);

CREATE TABLE screening_answers (
    id BIGSERIAL PRIMARY KEY,
    screening_session_id BIGINT NOT NULL,
    question_id VARCHAR(255) NOT NULL,
    answer_value TEXT NOT NULL,
    CONSTRAINT fk_screening_answers_session
        FOREIGN KEY (screening_session_id) REFERENCES screening_sessions(id) ON DELETE CASCADE
);
