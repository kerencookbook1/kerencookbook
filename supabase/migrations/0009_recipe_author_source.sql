-- Attribution metadata for recipes.
--
-- author       — a human name (the shef who wrote it: "סבתא רות", "יותם אוטולנגי")
-- source_name  — the site/publication the recipe came from ("AllRecipes",
--                "בישולים של רותי"). For manually-entered recipes we leave it
--                NULL and treat "המטבח של קרן" as the default in the UI.
-- source_url   — the original URL when the recipe was imported from a link.
--                Kept alongside source_name so we can render a "המקור" link.
--
-- All three are nullable and free-text. Values arrive from three places:
--   1. URL import: parsed from JSON-LD schema.org/Recipe author + the URL host.
--   2. User input: the recipe editor exposes them so users can fill/fix
--      by hand when auto-detection failed (per the user's ask on 2026-09-12).
--   3. Video import: the YouTube channel name goes into `author`.

ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS author      TEXT,
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS source_url  TEXT;
