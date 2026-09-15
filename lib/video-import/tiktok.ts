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

  // Primary path: og:description. Some TikTok responses omit it (the
  // logged-out shell suppresses OG tags), so fall back to parsing the
  // universal state blob that ships with the desktop HTML.
  let description = (og.description ?? '').trim() || null
  let title = og.title?.trim() || null

  if (!description) {
    const blob = await fetchTikTokUniversalData(url)
    if (blob) {
      description = blob.desc || description
      title = title || blob.title
    }
  }

  return {
    title: title || description?.split('\n')[0]?.slice(0, 80) || null,
    description,
    author,
    thumbnailUrl: og.imageUrl,
    canonicalUrl: og.finalUrl,
  }
}

/**
 * TikTok ships every page with a `<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__">`
 * JSON blob. When the request wasn't rate-limited, that blob contains a
 * `webapp.video-detail.itemInfo.itemStruct.desc` field with the full caption —
 * often longer + cleaner than og:description. We parse it as a fallback so we
 * can still auto-extract when TikTok chose to omit the OG tags.
 *
 * Returns null on any failure (page didn't include the blob, statusCode≠0, etc.).
 * Callers should treat null as "captions unavailable — invite the user to paste".
 */
async function fetchTikTokUniversalData(
  url: string,
): Promise<{ desc: string | null; title: string | null } | null> {
  try {
    const r = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'he,en;q=0.9',
      },
      signal: AbortSignal.timeout(15_000),
    })
    if (!r.ok) return null
    const html = await r.text()
    const marker = 'id="__UNIVERSAL_DATA_FOR_REHYDRATION__"'
    const start = html.indexOf(marker)
    if (start < 0) return null
    const openBrace = html.indexOf('{', start)
    const closeTag = html.indexOf('</script>', openBrace)
    if (openBrace < 0 || closeTag < 0) return null
    const json = html.slice(openBrace, closeTag).trim()
    const parsed = JSON.parse(json) as {
      __DEFAULT_SCOPE__?: {
        'webapp.video-detail'?: {
          statusCode?: number
          itemInfo?: {
            itemStruct?: {
              desc?: string
              contents?: Array<{ desc?: string }>
            }
          }
        }
      }
    }
    const scope = parsed?.__DEFAULT_SCOPE__?.['webapp.video-detail']
    if (!scope || scope.statusCode !== 0) return null
    const item = scope.itemInfo?.itemStruct
    const desc = item?.desc?.trim() || item?.contents?.[0]?.desc?.trim() || null
    return { desc, title: desc?.split('\n')[0]?.slice(0, 80) || null }
  } catch {
    return null
  }
}
