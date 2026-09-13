/**
 * TikTok source helpers. Recipe posts on TikTok almost always include the
 * ingredients + method in the video caption, which the page exposes as
 * `<meta property="og:description">`. We fetch the page (following short
 * links like `vm.tiktok.com/…` to the canonical `/@user/video/…` URL) and
 * turn the caption into the "transcript" the AI extractor consumes.
 *
 * We do NOT try to download the video's audio. TikTok blocks scrapers and
 * requires interactive sign-in for anything beyond the public shell. For
 * captions-only videos, the user can still upload the audio manually via
 * the file-upload path on /import/video.
 */

import { fetchOgTags } from './og-tags'

export type TikTokMetadata = {
  title: string | null
  description: string | null
  author: string | null
  thumbnailUrl: string | null
  canonicalUrl: string
}

const TIKTOK_HOST_PATTERNS: RegExp[] = [
  /^www\.tiktok\.com$/i,
  /^tiktok\.com$/i,
  /^m\.tiktok\.com$/i,
  /^vm\.tiktok\.com$/i,
  /^vt\.tiktok\.com$/i,
]

export function isTikTokUrl(input: string): boolean {
  try {
    const url = new URL(input.trim())
    return TIKTOK_HOST_PATTERNS.some((p) => p.test(url.hostname))
  } catch {
    return false
  }
}

/**
 * Try to pull an @author handle out of a canonical TikTok video URL.
 * Example: `https://www.tiktok.com/@ronsberi/video/7300000000000` → "ronsberi"
 */
function extractAuthorHandle(canonicalUrl: string): string | null {
  try {
    const url = new URL(canonicalUrl)
    const parts = url.pathname.split('/').filter(Boolean)
    const at = parts.find((p) => p.startsWith('@'))
    return at ? at.slice(1) : null
  } catch {
    return null
  }
}

export async function fetchTikTokMetadata(url: string): Promise<TikTokMetadata> {
  const og = await fetchOgTags(url)

  // The og:title on TikTok is typically shaped like:
  // "TikTok · @ronsberi" or "video from @ronsberi on TikTok"
  // Pull the handle out for the author field, and clean the title.
  const handle = extractAuthorHandle(og.finalUrl)
  const author = handle ? `@${handle}` : (og.siteName || 'TikTok')

  // Description is where the recipe lives.
  const description = (og.description ?? '').trim() || null
  const title = og.title?.trim() || description?.split('\n')[0]?.slice(0, 80) || null

  return {
    title,
    description,
    author,
    thumbnailUrl: og.imageUrl,
    canonicalUrl: og.finalUrl,
  }
}
