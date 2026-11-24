-- Copies of form inquiries (the store receives each one by email).
-- Deleted automatically after 12 months (daily cron in worker/index.ts).
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('contact', 'professional')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  profession TEXT,
  business TEXT,
  message TEXT,
  marketing_consent INTEGER NOT NULL DEFAULT 0,
  locale TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS inquiries_created_at ON inquiries (created_at);
