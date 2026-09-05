import { readStore, type ProviderId } from './preview-providers'
import { extractRecipeFromText, type ExtractedRecipe } from './provider-adapters'

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
    // Read as text with size cap
    const contentLength = Number(r.headers.get('content-length') ?? 0)
    if (contentLength && contentLength > MAX_HTML_BYTES) {
      throw new Error('הדף גדול מדי (מעל 5MB)')
    }
    const html = await r.text()
    if (html.length > MAX_HTML_BYTES) {
      throw new Error('הדף גדול מדי (מעל 5MB)')
    }
    return { html, contentType }
  } finally {
    clearTimeout(timer)
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
    source_url: sourceUrl,
    source_site: safeHostname(sourceUrl),
    image_url: parseImage(recipe['image']),
    method: 'json-ld',
  }
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

function parseStringArray(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v
      .map((x) => (typeof x === 'string' ? x : typeof x === 'object' && x && 'text' in x ? String((x as Record<string, unknown>).text) : ''))
      .map((s) => s.trim())
      .filter(Boolean)
  }
  if (typeof v === 'string') {
    return v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  }
  return []
}

function parseInstructions(v: unknown): string[] {
  if (!v) return []
  if (typeof v === 'string') {
    return v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  }
  if (Array.isArray(v)) {
    const out: string[] = []
    for (const item of v) {
      if (typeof item === 'string') {
        if (item.trim()) out.push(item.trim())
      } else if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>
        const type = String(obj['@type'] ?? '').toLowerCase()
        if (type === 'howtosection' && Array.isArray(obj['itemListElement'])) {
          for (const sub of obj['itemListElement'] as unknown[]) {
            if (sub && typeof sub === 'object' && 'text' in sub) {
              const t = String((sub as Record<string, unknown>).text ?? '').trim()
              if (t) out.push(t)
            }
          }
        } else if ('text' in obj) {
          const t = String(obj['text'] ?? '').trim()
          if (t) out.push(t)
        } else if ('name' in obj) {
          const t = String(obj['name'] ?? '').trim()
          if (t) out.push(t)
        }
      }
    }
    return out
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
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
}

/* ─────────────────────────────────────────────────────
   HTML → plain text (for AI fallback)
   ───────────────────────────────────────────────────── */
export function stripHtml(html: string): string {
  return html
    // remove full <script>/<style> blocks including content
    .replace(/<(script|style|noscript|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    // remove all remaining tags
    .replace(/<[^>]+>/g, ' ')
    // decode a few common entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    // collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/* ─────────────────────────────────────────────────────
   MAIN — try JSON-LD first, then AI fallback
   ───────────────────────────────────────────────────── */
export async function importRecipeFromUrl(rawUrl: string): Promise<ImportResult> {
  const validation = validateUrl(rawUrl)
  if (!validation.ok) throw new Error(validation.error)
  const url = validation.url

  const { html } = await safeFetch(url)

  // Fast path — structured Recipe schema
  const jsonLd = extractFromJsonLd(html, url.toString())
  if (jsonLd && (jsonLd.ingredients.length > 0 || jsonLd.steps.length > 0)) {
    return { ...jsonLd, provider: 'schema.org/Recipe (JSON-LD)' }
  }

  // Slow path — send text to AI
  const store = await readStore()
  const active = store.active && store.providers[store.active]?.key
    ? { id: store.active as ProviderId, key: store.providers[store.active]!.key }
    : null

  // Fallback chain (same as scan)
  const candidates: { id: ProviderId; key: string }[] = []
  if (active) candidates.push(active)
  for (const id of ['anthropic', 'openai', 'google'] as ProviderId[]) {
    const cfg = store.providers[id]
    if (cfg?.key && !candidates.find((c) => c.id === id)) {
      candidates.push({ id, key: cfg.key })
    }
  }
  if (candidates.length === 0) {
    const envMap: [ProviderId, string | undefined][] = [
      ['anthropic', process.env.AI_PROVIDER_ANTHROPIC_API_KEY],
      ['openai', process.env.AI_PROVIDER_OPENAI_API_KEY],
      ['google', process.env.AI_PROVIDER_GOOGLE_API_KEY],
    ]
    for (const [id, key] of envMap) {
      if (key) candidates.push({ id, key })
    }
  }
  if (candidates.length === 0) {
    throw new Error(
      'הדף לא כולל מבנה מתכון סטנדרטי (schema.org). כדי להשלים ייבוא בעזרת AI — הגדירי מפתח בעמוד ההגדרות.'
    )
  }

  const text = stripHtml(html).slice(0, 50_000)
  const errors: string[] = []
  for (const { id, key } of candidates) {
    try {
      const recipe = await extractRecipeFromText(id, key, text, url.toString())
      return {
        ...recipe,
        source_url: url.toString(),
        source_site: safeHostname(url.toString()),
        method: 'ai',
      }
    } catch (err) {
      errors.push(`${id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  throw new Error(`החילוץ נכשל בכל הספקים:\n${errors.join('\n')}`)
}
