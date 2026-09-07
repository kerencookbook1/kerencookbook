-- Favorites + rating + difficulty + personal notes
-- Migration: 0005_recipe_favorites_rating

ALTER TABLE recipes
  ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN difficulty  TEXT             CHECK (difficulty IN ('קל', 'בינוני', 'קשה')),
  ADD COLUMN rating      INTEGER          CHECK (rating BETWEEN 1 AND 5),
  ADD COLUMN notes       TEXT;

CREATE INDEX recipes_owner_favorite_idx ON recipes (owner_id, is_favorite) WHERE is_favorite = TRUE;

COMMENT ON COLUMN recipes.is_favorite IS 'User marked this recipe as favorite (shown in home page section).';
COMMENT ON COLUMN recipes.difficulty  IS 'One of: קל / בינוני / קשה. NULL means unspecified.';
COMMENT ON COLUMN recipes.rating      IS 'User 1–5 star rating. NULL means unrated.';
COMMENT ON COLUMN recipes.notes       IS 'Personal cooking notes / tweaks / substitutions.';
