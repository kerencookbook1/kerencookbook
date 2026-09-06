-- Per-user storage for AI provider API keys
-- Migration: 0003_ai_providers

CREATE TABLE ai_providers (
  owner_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider        TEXT        NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google')),
  api_key         TEXT        NOT NULL,
  is_active       BOOLEAN     NOT NULL DEFAULT FALSE,
  saved_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_tested_at  TIMESTAMPTZ,
  last_test_ok    BOOLEAN,
  last_test_error TEXT,
  PRIMARY KEY (owner_id, provider)
);

ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON ai_providers FOR ALL USING (auth.uid() = owner_id);

-- At most one active provider per owner
CREATE UNIQUE INDEX ai_providers_one_active_per_owner
  ON ai_providers (owner_id) WHERE is_active = TRUE;
