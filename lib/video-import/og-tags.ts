/**
 * Fetch a public webpage and read its OpenGraph meta tags. Used by the
 * TikTok and Instagram source implementations — both platforms serve their
 * recipe / video caption text as `og:description`, so we can pipe it
 * straight into the same AI-extraction stage the URL importer uses.
 */

export type OgTags = {
  title: string | null
  description: string | null
  imageUrl: string | null
  siteName: string | null
  finalUrl: string
}

const FETCH_TIMEOUT_MS = 15_000
const MAX_HTML_BYTES = 5 * 1024 * 1024

/**
 * Fetch the URL and return its OpenGraph tags. Sends browser-like headers
 * so anti-scraping shims don't return an empty shell. `finalUrl` is the URL
 * after any redirects — needed for TikTok short-links (`vm.tiktok.com/…`).
 */
export async function fetchOgTags(url: string): Promise<OgTags> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const r = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        // Real-looking Chrome UA — TikTok in particular returns a
        // stripped-down page for anything that looks like a scraper.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'he,en;q=0.9',
      },
    })
    if (!r.ok) throw new Error(`הכתובת החזירה HTTP ${r.status}`)

    const buffer = await r.arrayBuffer()
    if (buffer.byteLength > MAX_HTML_BYTES) {
      throw new Error('הדף גדול מדי (מעל 5MB)')
    }
    const contentType = r.headers.get('content-type') ?? ''
    const charset = /charset\s*=\s*"?([^";\s]+)/i.exec(contentType)?.[1] ?? 'utf-8'
    const html = new TextDecoder(charset.toLowerCase(), { fatal: false }).decode(new Uint8Array(buffer))

    return {
      title: readMeta(html, 'og:title') ?? readTitleTag(html),
      description: readMeta(html, 'og:description') ?? readMeta(html, 'description'),
      imageUrl: readMeta(html, 'og:image') ?? readMeta(html, 'og:image:secure_url'),
      siteName: readMeta(html, 'og:site_name'),
      finalUrl: r.url || url,
    }
  } finally {
    clearTimeout(timer)
  }
}

/** Read `<meta property="og:X" content="…">` and its `name="X"` twin. */
function readMeta(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property\\s*=\\s*["']${escapeRegex(key)}["'][^>]*content\\s*=\\s*["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content\\s*=\\s*["']([^"']*)["'][^>]*property\\s*=\\s*["']${escapeRegex(key)}["']`, 'i'),
    new RegExp(`<meta[^>]+name\\s*=\\s*["']${escapeRegex(key)}["'][^>]*content\\s*=\\s*["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content\\s*=\\s*["']([^"']*)["'][^>]*name\\s*=\\s*["']${escapeRegex(key)}["']`, 'i'),
  ]
  for (const re of patterns) {
    const m = re.exec(html)
    if (m?.[1]) return decodeHtmlEntities(m[1])
  }
  return null
}

function readTitleTag(html: string): string | null {
  const m = /<title[^>]*>([^<]+)<\/title>/i.exec(html)
  return m?.[1] ? decodeHtmlEntities(m[1]).trim() : null
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
}
