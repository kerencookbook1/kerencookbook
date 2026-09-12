-- Persist a reference to the *original* photo a recipe was OCR'd from.
--
-- The photo import flow currently discards the photo after OCR: the recipe
-- ends up with title + ingredients + steps, but the user can no longer see
-- the handwritten card / cookbook page they scanned. That kills provenance
-- for handwritten and family-cookbook imports.
--
-- We now upload the normalized photo to Supabase Storage during "save" and
-- keep the storage key here. The recipe view will render a "📷 צפי בצילום
-- המקור" button when this column is populated, complementing the existing
-- source_url button used for URL/video imports.
--
-- Migration: 0010_recipe_source_photo

ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS source_photo_path TEXT;
