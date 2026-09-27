-- Add optional model override per provider
-- Migration: 0014_ai_providers_model
ALTER TABLE ai_providers
  ADD COLUMN IF NOT EXISTS model TEXT;
