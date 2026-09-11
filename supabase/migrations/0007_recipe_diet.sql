-- Diet flag for recipes — auto-detected + manual override
-- Migration: 0007_recipe_diet

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS is_diet_auto     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS is_diet_override BOOLEAN;

-- Partial index for fast filtering on the library page.
CREATE INDEX IF NOT EXISTS recipes_owner_diet_idx ON recipes (owner_id)
  WHERE COALESCE(is_diet_override, is_diet_auto) = TRUE;

COMMENT ON COLUMN recipes.is_diet_auto     IS 'Computed at save time by lib/diet.ts scoreDiet(); overwritten on every update.';
COMMENT ON COLUMN recipes.is_diet_override IS 'User manual choice; NULL means auto-detection is in effect.';
