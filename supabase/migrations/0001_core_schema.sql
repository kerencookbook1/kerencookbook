-- Core schema for recipe app
-- Migration: 0001_core_schema

-- profiles: one row per auth user
CREATE TABLE profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "owner_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "owner_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- recipes
CREATE TABLE recipes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  prep_time   INTEGER,
  cook_time   INTEGER,
  servings    INTEGER,
  status      TEXT        NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'published')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON recipes FOR ALL USING (auth.uid() = owner_id);

-- ingredient_groups
CREATE TABLE ingredient_groups (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID    NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  title     TEXT,
  position  INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE ingredient_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON ingredient_groups FOR ALL USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = ingredient_groups.recipe_id
      AND recipes.owner_id = auth.uid()
  )
);

-- ingredients
-- amount stored as TEXT to support fractions like "½ כוס" or "1-2"
CREATE TABLE ingredients (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID    NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  group_id  UUID    REFERENCES ingredient_groups(id) ON DELETE SET NULL,
  name      TEXT    NOT NULL,
  amount    TEXT,
  unit      TEXT,
  position  INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON ingredients FOR ALL USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = ingredients.recipe_id
      AND recipes.owner_id = auth.uid()
  )
);

-- recipe_steps
CREATE TABLE recipe_steps (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id        UUID    NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  title            TEXT,
  body             TEXT    NOT NULL,
  duration_seconds INTEGER,
  position         INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON recipe_steps FOR ALL USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_steps.recipe_id
      AND recipes.owner_id = auth.uid()
  )
);

-- recipe_images
CREATE TABLE recipe_images (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id    UUID    NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  storage_path TEXT    NOT NULL,
  is_primary   BOOLEAN NOT NULL DEFAULT FALSE,
  position     INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE recipe_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON recipe_images FOR ALL USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_images.recipe_id
      AND recipes.owner_id = auth.uid()
  )
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_recipes
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
