-- Recipe categories — single category per recipe
-- Migration: 0004_recipe_category

ALTER TABLE recipes ADD COLUMN category TEXT;

-- Index for fast filtering on home / library pages
CREATE INDEX recipes_owner_category_idx ON recipes (owner_id, category) WHERE category IS NOT NULL;

COMMENT ON COLUMN recipes.category IS 'Free-form category label. Client validates against lib/categories.ts.';
