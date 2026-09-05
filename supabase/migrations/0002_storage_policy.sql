-- Storage bucket and policies for recipe images
-- Migration: 0002_storage_policy

-- Create the bucket (idempotent via DO block)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recipe-images',
  'recipe-images',
  false,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Helper: extract owner_id from object path.
-- Expected path structure: {owner_id}/{recipe_id}/{filename}
-- e.g. "a1b2c3d4-.../e5f6.../photo.jpg"
CREATE OR REPLACE FUNCTION storage_recipe_image_owner(object_name TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT split_part(object_name, '/', 1)::UUID;
$$;

-- SELECT: owner can read their own images
CREATE POLICY "owner_select"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'recipe-images'
    AND auth.uid() = storage_recipe_image_owner(name)
  );

-- INSERT: owner can upload to their own folder
CREATE POLICY "owner_insert"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'recipe-images'
    AND auth.uid() = storage_recipe_image_owner(name)
  );

-- UPDATE: owner can replace their own images
CREATE POLICY "owner_update"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'recipe-images'
    AND auth.uid() = storage_recipe_image_owner(name)
  );

-- DELETE: owner can delete their own images
CREATE POLICY "owner_delete"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'recipe-images'
    AND auth.uid() = storage_recipe_image_owner(name)
  );
