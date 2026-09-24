-- Record which provider/model actually handled each OCR scan.
CREATE TABLE ocr_scan_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google')),
  model       TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('succeeded', 'failed')),
  details     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ocr_scan_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON ocr_scan_logs
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX ocr_scan_logs_owner_created_idx
  ON ocr_scan_logs (owner_id, created_at DESC);
