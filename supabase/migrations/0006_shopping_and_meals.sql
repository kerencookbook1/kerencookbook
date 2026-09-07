-- Shopping list + weekly meal planning
-- Migration: 0006_shopping_and_meals

-- ─────────────────────────────────────────────
-- Shopping list — one row per item, grouped by aisle
-- ─────────────────────────────────────────────
CREATE TABLE shopping_items (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name              TEXT        NOT NULL,
  amount            TEXT,
  unit              TEXT,
  aisle             TEXT,       -- 'ירקות ופירות', 'מוצרי חלב', 'בשר ודגים', etc — client-guessed
  is_checked        BOOLEAN     NOT NULL DEFAULT FALSE,
  source_recipe_id  UUID        REFERENCES recipes(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON shopping_items FOR ALL USING (auth.uid() = owner_id);
CREATE INDEX shopping_items_owner_idx ON shopping_items (owner_id, is_checked, aisle);

COMMENT ON COLUMN shopping_items.aisle IS 'Supermarket aisle bucket — client sets from keyword map.';

-- ─────────────────────────────────────────────
-- Weekly meal plans — one recipe per (date, meal_type) per user
-- ─────────────────────────────────────────────
CREATE TABLE meal_plans (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date       DATE        NOT NULL,
  meal_type  TEXT        NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  recipe_id  UUID        NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_id, date, meal_type)
);
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON meal_plans FOR ALL USING (auth.uid() = owner_id);
CREATE INDEX meal_plans_owner_date_idx ON meal_plans (owner_id, date);
