import { NextResponse } from 'next/server'
import { readStore, type ProviderId } from '@/lib/preview-providers'
import { extractRecipeFromText } from '@/lib/provider-adapters'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_TEXT_LENGTH = 50_000

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף לא תקין (JSON)' }, { status: 400 })
  }

  const text = (body as { text?: unknown }).text
  if (typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'שדה text חסר' }, { status: 400 })
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: `הטקסט ארוך מדי (מקסימום ${MAX_TEXT_LENGTH} תווים)` }, { status: 413 })
  }

  const store = await readStore()
  const candidates: { id: ProviderId; key: string }[] = []

  if (store.active && store.providers[store.active]?.key) {
    candidates.push({ id: store.active, key: store.providers[store.active]!.key })
  }
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
    return NextResponse.json(
      { error: 'לא הוגדר ספק AI. עברי להגדרות ה-API להוסיף מפתח.' },
      { status: 503 }
    )
  }

  const errors: string[] = []
  for (const { id, key } of candidates) {
    try {
      const recipe = await extractRecipeFromText(id, key, text.trim(), '')
      return NextResponse.json(recipe)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[import-text] ${id} failed:`, msg)
      errors.push(`${id}: ${msg}`)
    }
  }

  return NextResponse.json(
    { error: 'החילוץ נכשל בכל הספקים', detail: errors },
    { status: 502 }
  )
}
