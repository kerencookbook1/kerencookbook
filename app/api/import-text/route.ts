import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getKeyCandidates } from '@/lib/ai-providers'
import { extractRecipeFromText } from '@/lib/provider-adapters'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_TEXT_LENGTH = 50_000

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

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

  const candidates = await getKeyCandidates()
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
