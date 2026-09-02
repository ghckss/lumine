CREATE TABLE IF NOT EXISTS content_import_receipts (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    imported_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_content_import_user_item UNIQUE (user_id, item_id),
    CONSTRAINT fk_content_import_receipts_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_content_import_receipts_user
    ON content_import_receipts(user_id);
