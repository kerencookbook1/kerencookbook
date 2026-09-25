-- Extend provider CHECK constraints to include openrouter
-- Migration: 0013_add_openrouter_provider

ALTER TABLE ai_providers
  DROP CONSTRAINT IF EXISTS ai_providers_provider_check,
  ADD CONSTRAINT ai_providers_provider_check
    CHECK (provider IN ('openai', 'anthropic', 'google', 'openrouter'));

CREATE TABLE IF NOT EXISTS ocr_scan_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'openrouter')),
  model       TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('succeeded', 'failed')),
  details     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ocr_scan_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ocr_scan_logs' AND policyname = 'owner_all'
  ) THEN
    CREATE POLICY "owner_all" ON ocr_scan_logs
      FOR ALL USING (auth.uid() = owner_id)
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'ocr_scan_logs' AND indexname = 'ocr_scan_logs_owner_created_idx'
  ) THEN
    CREATE INDEX ocr_scan_logs_owner_created_idx
      ON ocr_scan_logs (owner_id, created_at DESC);
  END IF;
END $$;

ALTER TABLE ocr_scan_logs
  DROP CONSTRAINT IF EXISTS ocr_scan_logs_provider_check,
  ADD CONSTRAINT ocr_scan_logs_provider_check
    CHECK (provider IN ('openai', 'anthropic', 'google', 'openrouter'));
