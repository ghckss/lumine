CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    provider VARCHAR(20) NOT NULL,
    provider_subject VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20),
    birth_date DATE,
    agreed_to_terms BOOLEAN NOT NULL DEFAULT FALSE,
    signed_up_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_users_provider_subject UNIQUE (provider, provider_subject)
);

ALTER TABLE IF EXISTS journal_entries ADD COLUMN IF NOT EXISTS user_id VARCHAR(36);
ALTER TABLE IF EXISTS screening_sessions ADD COLUMN IF NOT EXISTS user_id VARCHAR(36);

DO $$
DECLARE
    existing_constraint TEXT;
BEGIN
    SELECT constraint_name
      INTO existing_constraint
      FROM information_schema.table_constraints
     WHERE table_schema = current_schema()
       AND table_name = 'journal_entries'
       AND constraint_type = 'UNIQUE'
       AND constraint_name IN (
           SELECT constraint_name
             FROM information_schema.constraint_column_usage
            WHERE table_schema = current_schema()
              AND table_name = 'journal_entries'
              AND column_name = 'entry_date'
       )
     LIMIT 1;

    IF existing_constraint IS NOT NULL THEN
        EXECUTE format('ALTER TABLE journal_entries DROP CONSTRAINT %I', existing_constraint);
    END IF;
END $$;

DO $$
BEGIN
    IF to_regclass(current_schema() || '.journal_entries') IS NOT NULL THEN
        CREATE UNIQUE INDEX IF NOT EXISTS uk_journal_user_date
            ON journal_entries(user_id, entry_date);
        CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date
            ON journal_entries(user_id, entry_date DESC);

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_journal_entries_user'
        ) THEN
            ALTER TABLE journal_entries
                ADD CONSTRAINT fk_journal_entries_user
                FOREIGN KEY (user_id) REFERENCES users(id);
        END IF;
    END IF;

    IF to_regclass(current_schema() || '.screening_sessions') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_screening_sessions_user_date
            ON screening_sessions(user_id, completed_date DESC);

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_screening_sessions_user'
        ) THEN
            ALTER TABLE screening_sessions
                ADD CONSTRAINT fk_screening_sessions_user
                FOREIGN KEY (user_id) REFERENCES users(id);
        END IF;
    END IF;
END $$;
