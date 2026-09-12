-- Make the `recipe-images` bucket public-read so images uploaded from the
-- editor can be rendered with a plain <img src="..."> across all list/detail
-- pages without generating a signed URL per image.
--
-- Uploads are still gated by the RLS policies defined in 0002_storage_policy:
-- only the recipe owner can INSERT / UPDATE / DELETE objects under their own
-- `{owner_id}/{recipe_id}/*` prefix. Making the bucket public affects READ
-- only. Storage paths embed a UUID recipe_id and a UUID filename, so URLs
-- are effectively unguessable.
--
-- Migration: 0008_recipe_images_public_read

UPDATE storage.buckets
SET public = true
WHERE id = 'recipe-images';
