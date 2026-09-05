import { NextResponse } from 'next/server'
import { readStore, type ProviderId } from '@/lib/preview-providers'
import { extractRecipe } from '@/lib/provider-adapters'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  // 1. Load provider config (stored keys first, then env fallback)
  const store = await readStore()

  // Build ordered list of providers to try: active first, then any others with a key,
  // then env-var fallbacks.
  const candidates: { id: ProviderId; key: string; source: string }[] = []

  if (store.active && store.providers[store.active]?.key) {
    candidates.push({
      id: store.active,
      key: store.providers[store.active]!.key,
      source: 'stored:active',
    })
  }
  for (const id of ['anthropic', 'openai', 'google'] as ProviderId[]) {
    const cfg = store.providers[id]
    if (cfg?.key && !candidates.find((c) => c.id === id)) {
      candidates.push({ id, key: cfg.key, source: 'stored' })
    }
  }
  // Env-var fallbacks (only if nothing stored)
  if (candidates.length === 0) {
    const envMap: [ProviderId, string | undefined][] = [
      ['anthropic', process.env.AI_PROVIDER_ANTHROPIC_API_KEY],
      ['openai', process.env.AI_PROVIDER_OPENAI_API_KEY],
      ['google', process.env.AI_PROVIDER_GOOGLE_API_KEY],
    ]
    for (const [id, key] of envMap) {
      if (key) candidates.push({ id, key, source: 'env' })
    }
  }

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: 'לא הוגדר ספק AI. עברי להגדרות ה-API להוסיף מפתח.' },
      { status: 503 }
    )
  }

  // 2. Parse image
  let imageBase64: string
  let mimeType: string
  try {
    const formData = await request.formData()
    const image = formData.get('image')
    if (!(image instanceof File)) {
      return NextResponse.json({ error: 'שדה image חסר או לא תקין' }, { status: 400 })
    }
    if (image.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'תמונה גדולה מדי (מקסימום 8MB)' }, { status: 413 })
    }
    const bytes = await image.arrayBuffer()
    imageBase64 = Buffer.from(bytes).toString('base64')
    mimeType = image.type || 'image/jpeg'
  } catch (err) {
    return NextResponse.json(
      { error: 'לא ניתן לקרוא את התמונה', detail: String(err) },
      { status: 400 }
    )
  }

  // 3. Try each candidate provider until one succeeds
  const errors: string[] = []
  for (const { id, key } of candidates) {
    try {
      const recipe = await extractRecipe(id, key, imageBase64, mimeType)
      return NextResponse.json(recipe)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[scan] ${id} failed:`, msg)
      errors.push(`${id}: ${msg}`)
    }
  }

  return NextResponse.json(
    { error: 'החילוץ נכשל בכל הספקים', detail: errors },
    { status: 502 }
  )
}
