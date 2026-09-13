/**
 * Instagram source helpers. Works for public Reels, IGTV, and feed posts —
 * the video caption is served in `og:description` on the page and includes
 * whatever the creator typed (ingredients, method, quantities in their
 * native format).
 *
 * Private accounts and login-gated content are NOT supported — Instagram
 * returns a login redirect and no useful og tags in that case. The route
 * surfaces a clear error message when that happens.
 */

import { fetchOgTags } from './og-tags'

export type InstagramMetadata = {
  title: string | null
  description: string | null
  author: string | null
  thumbnailUrl: string | null
  canonicalUrl: string
}

const IG_HOST_PATTERNS: RegExp[] = [
  /^www\.instagram\.com$/i,
  /^instagram\.com$/i,
  /^m\.instagram\.com$/i,
]

const IG_PATH_PATTERNS: RegExp[] = [
  /^\/p\/[^/]+/i,       // /p/{shortcode}
  /^\/reel\/[^/]+/i,    // /reel/{shortcode}
  /^\/reels\/[^/]+/i,   // /reels/{shortcode}
  /^\/tv\/[^/]+/i,      // /tv/{shortcode}
]

export function isInstagramUrl(input: string): boolean {
  try {
    const url = new URL(input.trim())
    if (!IG_HOST_PATTERNS.some((p) => p.test(url.hostname))) return false
    return IG_PATH_PATTERNS.some((p) => p.test(url.pathname))
  } catch {
    return false
  }
}

/** Instagram's og:title is often "@handle on Instagram: caption" — pull the handle out. */
function extractAuthorHandle(og: { title: string | null }): string | null {
  const t = og.title ?? ''
  const at = /@([A-Za-z0-9_.]+)/.exec(t)
  return at?.[1] ?? null
}

export async function fetchInstagramMetadata(url: string): Promise<InstagramMetadata> {
  const og = await fetchOgTags(url)

  const description = (og.description ?? '').trim() || null
  const handle = extractAuthorHandle(og)
  const author = handle ? `@${handle}` : (og.siteName || 'Instagram')

  const title = og.title?.trim() || description?.split('\n')[0]?.slice(0, 80) || null

  return {
    title,
    description,
    author,
    thumbnailUrl: og.imageUrl,
    canonicalUrl: og.finalUrl,
  }
}
