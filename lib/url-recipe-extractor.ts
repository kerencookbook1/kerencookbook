import type { ProviderId } from './preview-providers'
import { extractRecipeFromText, type ExtractedRecipe } from './provider-adapters'
import { prettySiteName } from './source-site-names'

export type ImportResult = ExtractedRecipe & {
  source_url: string
  source_site?: string
  image_url?: string
  method: 'json-ld' | 'ai'
}

const FETCH_TIMEOUT_MS = 15_000
const MAX_HTML_BYTES = 5 * 1024 * 1024  // 5MB

/* ─────────────────────────────────────────────────────
   SSRF GUARD — block private/loopback destinations
   ───────────────────────────────────────────────────── */
export function validateUrl(input: string): { ok: true; url: URL } | { ok: false; error: string } {
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    return { ok: false, error: 'כתובת URL לא תקינה' }
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, error: 'רק כתובות HTTP/HTTPS מותרות' }
  }
  const host = url.hostname.toLowerCase()

  // Block localhost & IP literals in private ranges
  if (host === 'localhost' || host === '0.0.0.0') {
    return { ok: false, error: 'לא ניתן לייבא מכתובת מקומית' }
  }
  // Reject IPv4 literals in RFC1918 ranges + link-local
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4) {
    const [a, b] = ipv4.slice(1).map((n) => parseInt(n, 10))
    if (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      a === 0
    ) {
      return { ok: false, error: 'כתובת פרטית אינה נתמכת' }
    }
  }
  // Reject IPv6 loopback / link-local / unique-local (rough)
  if (host.startsWith('[') || host.includes(':')) {
    if (
      host === '::1' ||
      host.startsWith('fe80:') ||
      host.startsWith('fc') ||
      host.startsWith('fd')
    ) {
      return { ok: false, error: 'כתובת פרטית אינה נתמכת' }
    }
  }
  return { ok: true, url }
}

/* ─────────────────────────────────────────────────────
   FETCH with timeout + size limit + safe headers
   ───────────────────────────────────────────────────── */
async function safeFetch(url: URL): Promise<{ html: string; contentType: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const r = await fetch(url.toString(), {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        // Pretend to be a real browser so recipe sites don't block us
        'User-Agent':
          'Mozilla/5.0 (compatible; KerenCookbook/1.0; +https://kerencookbook.local)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'he,en;q=0.9',
      },
    })
    if (!r.ok) throw new Error(`הכתובת החזירה HTTP ${r.status}`)
    const contentType = r.headers.get('content-type') ?? ''
    if (!contentType.includes('html') && !contentType.includes('xml')) {
      throw new Error(`תוכן לא נתמך: ${contentType || 'לא ידוע'}`)
    }
    const contentLength = Number(r.headers.get('content-length') ?? 0)
    if (contentLength && contentLength > MAX_HTML_BYTES) {
      throw new Error('הדף גדול מדי (מעל 5MB)')
    }
    // Read as bytes and decode with the right charset — critical for older
    // Hebrew sites like foodsdictionary.co.il that serve Windows-1255 without
    // Node's default UTF-8 fetch reader turning every Hebrew glyph into "?".
    const buffer = await r.arrayBuffer()
    if (buffer.byteLength > MAX_HTML_BYTES) {
      throw new Error('הדף גדול מדי (מעל 5MB)')
    }
    const html = decodeHtmlBytes(new Uint8Array(buffer), contentType)
    return { html, contentType }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Decode the raw HTML byte stream into a UTF-16 JS string using whichever
 * charset the response advertises. Precedence:
 *   1. `Content-Type: text/html; charset=X` on the response.
 *   2. `<meta charset="X">` or the older `<meta http-equiv=...>` inside the
 *      first ~4KB of the document (browsers read at most 1024 bytes; we're
 *      more generous).
 *   3. UTF-8 — but if that produces a suspicious ratio of replacement chars
 *      on a page that looks Hebrew, fall back to Windows-1255.
 */
function decodeHtmlBytes(bytes: Uint8Array, contentTypeHeader: string): string {
  // 1. Header charset takes priority when present
  const headerCharset = /charset\s*=\s*"?([^";\s]+)/i.exec(contentTypeHeader)?.[1]
  if (headerCharset) {
    const decoded = tryDecode(bytes, headerCharset)
    if (decoded) return decoded
  }

  // 2. Sniff <meta charset> in the first 4 KB using an ASCII-safe pass
  const preamble = new TextDecoder('windows-1252').decode(bytes.slice(0, 4096))
  const metaCharset =
    /<meta\s+charset\s*=\s*["']?([^"'>\s]+)/i.exec(preamble)?.[1] ??
    /<meta[^>]+http-equiv=["']?content-type["']?[^>]*content=["'][^"']*charset=([^"';\s]+)/i.exec(preamble)?.[1]
  if (metaCharset) {
    const decoded = tryDecode(bytes, metaCharset)
    if (decoded) return decoded
  }

  // 3. Fall back to UTF-8. If the result looks garbled AND contains no
  // Hebrew letters (even though the page probably should have some), retry
  // as Windows-1255. This catches sites that don't declare an encoding.
  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  const utf8HasHebrew = /[֐-׿]/.test(utf8)
  const utf8HasReplacement = /�/.test(utf8)
  if (!utf8HasHebrew && utf8HasReplacement) {
    const cp1255 = tryDecode(bytes, 'windows-1255')
    if (cp1255 && /[֐-׿]/.test(cp1255)) return cp1255
  }
  return utf8
}

/** Normalize charset labels (utf8 → utf-8) and decode; returns null if the encoding isn't supported. */
function tryDecode(bytes: Uint8Array, label: string): string | null {
  const normalized = label.trim().toLowerCase().replace(/^utf8$/, 'utf-8')
  try {
    return new TextDecoder(normalized, { fatal: false }).decode(bytes)
  } catch {
    return null
  }
}

/* ─────────────────────────────────────────────────────
   JSON-LD Recipe extraction (schema.org)
   ───────────────────────────────────────────────────── */
function findJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = []
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(html)) !== null) {
    const raw = match[1].trim()
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw)
      blocks.push(parsed)
    } catch {
      /* skip malformed JSON-LD */
    }
  }
  return blocks
}

function findRecipeNode(node: unknown): Record<string, unknown> | null {
  if (!node || typeof node !== 'object') return null
  const obj = node as Record<string, unknown>

  // Direct recipe
  const type = obj['@type']
  const isRecipe = Array.isArray(type)
    ? type.some((t) => String(t).toLowerCase() === 'recipe')
    : String(type ?? '').toLowerCase() === 'recipe'
  if (isRecipe) return obj

  // Nested inside @graph
  const graph = obj['@graph']
  if (Array.isArray(graph)) {
    for (const g of graph) {
      const r = findRecipeNode(g)
      if (r) return r
    }
  }

  return null
}

function extractFromJsonLd(html: string, sourceUrl: string): ImportResult | null {
  const blocks = findJsonLdBlocks(html)
  let recipe: Record<string, unknown> | null = null
  for (const block of blocks) {
    if (Array.isArray(block)) {
      for (const item of block) {
        recipe = findRecipeNode(item)
        if (recipe) break
      }
    } else {
      recipe = findRecipeNode(block)
    }
    if (recipe) break
  }
  if (!recipe) return null

  return {
    title: strGet(recipe, 'name') ?? 'מתכון ללא שם',
    description: strGet(recipe, 'description') ?? null,
    servings: parseYield(recipe['recipeYield']),
    prep_minutes: parseIsoDuration(strGet(recipe, 'prepTime')),
    cook_minutes: parseIsoDuration(strGet(recipe, 'cookTime')),
    ingredients: parseStringArray(recipe['recipeIngredient']),
    steps: parseInstructions(recipe['recipeInstructions']),
    author: parseAuthor(recipe['author']),
    source_url: sourceUrl,
    source_site: safeHostname(sourceUrl),
    image_url: parseImage(recipe['image']),
    method: 'json-ld',
  }
}

/**
 * schema.org/Recipe `author` can be:
 *   - a plain string ("Yotam Ottolenghi")
 *   - a Person object ({@type:"Person", name:"..."})
 *   - an array of either
 * Return the first legible name we can find.
 */
function parseAuthor(a: unknown): string | undefined {
  if (typeof a === 'string' && a.trim()) return a.trim()
  if (Array.isArray(a)) {
    for (const item of a) {
      const name = parseAuthor(item)
      if (name) return name
    }
    return undefined
  }
  if (a && typeof a === 'object') {
    const name = (a as Record<string, unknown>)['name']
    if (typeof name === 'string' && name.trim()) return name.trim()
  }
  return undefined
}

function strGet(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key]
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

function parseYield(y: unknown): number | null {
  if (typeof y === 'number') return Math.round(y)
  if (Array.isArray(y) && y.length) return parseYield(y[0])
  if (typeof y === 'string') {
    const m = y.match(/\d+/)
    return m ? parseInt(m[0], 10) : null
  }
  return null
}

function parseIsoDuration(s: string | null): number | null {
  if (!s) return null
  const m = s.match(/^P(?:T)?(?:(\d+)H)?(?:(\d+)M)?/i)
  if (!m) {
    // Non-ISO — try "15 min"
    const n = s.match(/(\d+)/)
    return n ? parseInt(n[1], 10) : null
  }
  const hours = parseInt(m[1] || '0', 10)
  const mins = parseInt(m[2] || '0', 10)
  return hours * 60 + mins
}

/**
 * Clean a chunk of recipe text that came out of JSON-LD:
 *   - Decode `&amp;` / `&#40;` / `&#x28;` etc.
 *   - Decode stray URL-encoded escapes like `%28` (foodsdictionary.co.il
 *     leaks these into ingredient names).
 *   - Turn `<br>`, `</br>`, `<br/>`, `<p>` into newlines.
 *   - Strip any remaining HTML tags.
 *   - Collapse whitespace.
 * The result is safe to display verbatim in the UI.
 */
function cleanRecipeText(input: string): string {
  let s = input

  // Newlines from HTML block-level tags
  s = s.replace(/<\s*br\s*\/?\s*>/gi, '\n')
  s = s.replace(/<\s*\/\s*br\s*>/gi, '\n')
  s = s.replace(/<\s*\/?\s*p\s*[^>]*>/gi, '\n')
  s = s.replace(/<\s*li\s*[^>]*>/gi, '\n')
  s = s.replace(/<\s*\/\s*li\s*>/gi, '')

  // Strip any remaining tags
  s = s.replace(/<[^>]+>/g, '')

  // HTML entities: named
  s = s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
  // Numeric decimal / hex entities
  s = s.replace(/&#(\d+);/g, (_, n) => {
    try { return String.fromCodePoint(parseInt(n, 10)) } catch { return _ }
  })
  s = s.replace(/&#x([0-9a-fA-F]+);/g, (_, n) => {
    try { return String.fromCodePoint(parseInt(n, 16)) } catch { return _ }
  })

  // Percent-encoded characters — decode individually so a broken sequence
  // doesn't nuke the rest of the string like decodeURIComponent would.
  s = s.replace(/%[0-9A-Fa-f]{2}/g, (m) => {
    try { return decodeURIComponent(m) } catch { return m }
  })

  // Collapse whitespace but keep newlines
  s = s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  return s
}

/** Strip leading "1.", "1)", "1 -" and similar step numbering from a line. */
function stripLeadingNumber(line: string): string {
  return line.replace(/^\s*\d+\s*[.)\-–]\s*/, '').trim()
}

/**
 * Split one long recipe-instructions string into individual steps.
 * The tricky case is a single string that already contains its own
 * numbering ("1. ... 2. ... 3. ...") with `<br>` between the items —
 * that's the shape foodsdictionary.co.il and several other Hebrew sites
 * use. We normalize breaks to `\n`, then split by inline "N." markers
 * when the string still has no line breaks after cleaning.
 */
function splitStepsString(input: string): string[] {
  const cleaned = cleanRecipeText(input)
  if (!cleaned) return []

  let pieces = cleaned.split(/\r?\n+/).map((s) => s.trim()).filter(Boolean)

  // If cleaning didn't produce multiple lines but the text still has "1." /
  // "2." markers inline, split on those. Uses lookahead so the marker stays
  // attached to its step (we strip it in the next pass).
  if (pieces.length <= 1 && /\d+\s*[.)]\s*\S/.test(cleaned)) {
    pieces = cleaned
      .split(/(?=\s\d+\s*[.)]\s)/)
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const steps = pieces
    .map(stripLeadingNumber)
    .filter((s) => s.length >= 2)

  // Drop consecutive duplicates — some feeds echo the same step twice.
  const dedup: string[] = []
  for (const step of steps) {
    if (dedup[dedup.length - 1] === step) continue
    dedup.push(step)
  }
  return dedup
}

function parseStringArray(v: unknown): string[] {
  const raw: string[] = []
  if (Array.isArray(v)) {
    for (const x of v) {
      if (typeof x === 'string') raw.push(x)
      else if (x && typeof x === 'object' && 'text' in x) {
        raw.push(String((x as Record<string, unknown>).text ?? ''))
      }
    }
  } else if (typeof v === 'string') {
    raw.push(...v.split(/\r?\n/))
  }
  return raw
    .map(cleanRecipeText)
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseInstructions(v: unknown): string[] {
  if (!v) return []
  if (typeof v === 'string') return splitStepsString(v)
  if (Array.isArray(v)) {
    const out: string[] = []
    for (const item of v) {
      if (typeof item === 'string') {
        out.push(...splitStepsString(item))
      } else if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>
        const type = String(obj['@type'] ?? '').toLowerCase()
        if (type === 'howtosection' && Array.isArray(obj['itemListElement'])) {
          for (const sub of obj['itemListElement'] as unknown[]) {
            if (sub && typeof sub === 'object' && 'text' in sub) {
              out.push(...splitStepsString(String((sub as Record<string, unknown>).text ?? '')))
            }
          }
        } else if ('text' in obj) {
          out.push(...splitStepsString(String(obj['text'] ?? '')))
        } else if ('name' in obj) {
          out.push(...splitStepsString(String(obj['name'] ?? '')))
        }
      }
    }
    // Dedupe again across the merged output — a common cause of the "steps
    // appear twice" bug we're fixing is a feed that puts the same block in
    // both a top-level string and a nested HowToStep list.
    const seen = new Set<string>()
    const unique: string[] = []
    for (const s of out) {
      const key = s.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      unique.push(s)
    }
    return unique
  }
  return []
}

function parseImage(v: unknown): string | undefined {
  if (typeof v === 'string') return v
  if (Array.isArray(v) && v.length) return parseImage(v[0])
  if (v && typeof v === 'object' && 'url' in v) return String((v as Record<string, unknown>).url ?? '')
  return undefined
}

function safeHostname(url: string): string | undefined {
  try {
    // Return the pretty site name (e.g. "יוחננוף") when we recognize the
    // domain; otherwise fall back to the raw hostname sans "www.".
    const raw = new URL(url).hostname
    return prettySiteName(raw)
  } catch {
    return undefined
  }
}

/* ─────────────────────────────────────────────────────
   Open Graph / Twitter image extraction (AI-path fallback)
   ───────────────────────────────────────────────────── */
function extractOgImage(html: string, baseUrl: string): string | undefined {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m?.[1]) {
      try {
        // Resolve relative URLs against the page
        return new URL(m[1], baseUrl).toString()
      } catch {
        return m[1]
      }
    }
  }
  return undefined
}

/* ─────────────────────────────────────────────────────
   HTML → plain text (for AI fallback)
   ───────────────────────────────────────────────────── */
export function stripHtml(html: string): string {
  return html
    // 1. Nuke full non-content blocks entirely (script/style/iframe never carry recipe text)
    .replace(/<(script|style|noscript|iframe|template|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    // 2. Nuke site chrome so the AI doesn't ingest navigation, cookie banners,
    //    "related recipes" rails, social share widgets, comments, footer credits, etc.
    //    These blocks routinely contaminate extraction on Hebrew media sites
    //    (foodsdictionary, ynet, mako, walla) with English boilerplate + irrelevant Hebrew.
    .replace(/<(nav|footer|aside|header)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(button|form|label|input|select|textarea)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    // 3. Class/id-based noise (best-effort — matches common patterns).
    //    Non-greedy match up to the matching closing tag; a false negative
    //    just leaves the noise in, doesn't corrupt anything.
    .replace(
      /<(\w+)\b[^>]*(?:class|id)\s*=\s*"[^"]*(?:menu|navbar|navigation|footer|sidebar|related|share|comment|newsletter|subscribe|cookie|breadcrumb|byline|credit|photograph|byline|author-box|pagination|social|widget|advert|banner|popup|modal|toolbar|tags?-list|meta-info)[^"]*"[^>]*>[\s\S]*?<\/\1>/gi,
      ' ',
    )
    // 4. Remove all remaining tags
    .replace(/<[^>]+>/g, ' ')
    // 5. Decode HTML entities (named + numeric)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => { try { return String.fromCodePoint(parseInt(n, 10)) } catch { return _ } })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => { try { return String.fromCodePoint(parseInt(n, 16)) } catch { return _ } })
    // 6. Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Post-processing filter for AI-returned step arrays. Kicks out lines that
 * clearly aren't recipe instructions:
 *   - Very short (< 15 chars — a real step is at least a sentence)
 *   - Look like a photo/edit/writer credit ("צילום: ...", "עורך: ...", "by ...")
 *   - Look like nav/CTA text ("קרא עוד", "read more", "לחצי כאן")
 *   - Pure English inside a Hebrew recipe (site chrome that snuck through)
 *   - Look like tag / hashtag / URL only
 * Ingredients get the same treatment so noise doesn't slip into that array.
 */
export function filterNoiseSteps(steps: string[], recipeLooksHebrew: boolean): string[] {
  return steps
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => s.length >= 15)
    .filter((s) => !/^(?:צילום|צלם|עורכ[הת]|כתב[הת]?|מגישה?|הצג|תוגית|תגיות|קטגורי[הת]|קרא\s+עוד|read\s+more|click\s+here|לחצ[יו]\s+כאן|שתפ[יו]|share\s+this|subscribe|register|log(?:\s+)?in|sign(?:\s+)?up|home\s*page|תפריט|about\s+us|contact\s+us|privacy\s+policy|copyright)/i.test(s))
    .filter((s) => !/^\s*(?:by|מאת)\s+\S+\s*$/i.test(s))
    .filter((s) => !/^\s*(?:https?:\/\/|www\.)/i.test(s))
    .filter((s) => !/^\s*#\S+\s*$/i.test(s))
    .filter((s) => {
      if (!recipeLooksHebrew) return true
      const hebChars = (s.match(/[֐-׿]/g) || []).length
      const latinChars = (s.match(/[A-Za-z]/g) || []).length
      // Reject "pure English" bits when the surrounding recipe is Hebrew.
      if (hebChars === 0 && latinChars > 5) return false
      return true
    })
}

/**
 * Cheap language sniff — returns true if the given text contains more
 * Hebrew letters than Latin letters (or has any Hebrew at all when Latin
 * is scarce). Used to gate the "reject pure-English" heuristic.
 */
export function looksHebrew(text: string): boolean {
  const heb = (text.match(/[֐-׿]/g) || []).length
  const lat = (text.match(/[A-Za-z]/g) || []).length
  return heb > lat || (heb > 0 && lat < 20)
}

/* ─────────────────────────────────────────────────────
   MAIN — try JSON-LD first, then AI fallback
   ───────────────────────────────────────────────────── */
export async function importRecipeFromUrl(
  rawUrl: string,
  candidates: { id: ProviderId; key: string }[]
): Promise<ImportResult> {
  const validation = validateUrl(rawUrl)
  if (!validation.ok) throw new Error(validation.error)
  const url = validation.url

  const { html } = await safeFetch(url)

  // Fast path — structured Recipe schema
  const jsonLd = extractFromJsonLd(html, url.toString())
  if (jsonLd && (jsonLd.ingredients.length > 0 || jsonLd.steps.length > 0)) {
    return {
      ...jsonLd,
      image_url: jsonLd.image_url ?? extractOgImage(html, url.toString()),
      provider: 'schema.org/Recipe (JSON-LD)',
    }
  }

  if (candidates.length === 0) {
    throw new Error(
      'הדף לא כולל מבנה מתכון סטנדרטי (schema.org). כדי להשלים ייבוא בעזרת AI — הגדירי מפתח בעמוד ההגדרות.'
    )
  }

  const text = stripHtml(html).slice(0, 50_000)
  const ogImage = extractOgImage(html, url.toString())
  const errors: string[] = []
  for (const { id, key } of candidates) {
    try {
      const recipe = await extractRecipeFromText(id, key, text, url.toString())
      // Post-process: kick out credit lines, English boilerplate, "read more"
      // links, hashtags, and other noise that leaked through from the page
      // shell into the AI's step + ingredient output.
      const hebrew = looksHebrew(recipe.title + ' ' + recipe.ingredients.join(' '))
      const cleanedIngredients = filterNoiseSteps(recipe.ingredients, hebrew)
      const cleanedSteps = filterNoiseSteps(recipe.steps, hebrew)
      return {
        ...recipe,
        ingredients: cleanedIngredients.length ? cleanedIngredients : recipe.ingredients,
        steps: cleanedSteps.length ? cleanedSteps : recipe.steps,
        source_url: url.toString(),
        source_site: safeHostname(url.toString()),
        image_url: ogImage,
        method: 'ai',
      }
    } catch (err) {
      errors.push(`${id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  throw new Error(`החילוץ נכשל בכל הספקים:\n${errors.join('\n')}`)
}
