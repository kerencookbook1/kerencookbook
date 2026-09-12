import type { SupabaseClient } from '@supabase/supabase-js'

/** Bucket name for user-uploaded recipe photos. Set to `public: true` in migration 0008. */
export const RECIPE_IMAGES_BUCKET = 'recipe-images'

/**
 * Resolve a `recipe_images.storage_path` value into a URL usable in `<img src>`.
 *
 * Two path shapes exist in the table:
 * 1. Legacy external URLs (`https://...`) — from URL/OCR imports. Returned as-is.
 * 2. Storage keys uploaded from the editor (`{owner_id}/{recipe_id}/{uuid}.jpg`) —
 *    resolved to the bucket's public URL directly from NEXT_PUBLIC_SUPABASE_URL.
 *
 * Building the URL from the env var (rather than calling `getPublicUrl`) keeps
 * this pure — no Supabase client required — so it's safe to call inside Server
 * Components and in loops.
 */
export function resolveRecipeImageUrl(
  _supabaseUnused: SupabaseClient | null,
  storagePath: string | null | undefined,
): string | null {
  if (!storagePath) return null
  const s = storagePath.trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base.replace(/\/$/, '')}/storage/v1/object/public/${RECIPE_IMAGES_BUCKET}/${encodeURI(s)}`
}
