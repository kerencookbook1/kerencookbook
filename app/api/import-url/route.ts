import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getKeyCandidates } from '@/lib/ai-providers'
import { importRecipeFromUrl, validateUrl } from '@/lib/url-recipe-extractor'

export const runtime = 'nodejs'
export const maxDuration = 60

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

  const url = (body as { url?: unknown }).url
  if (typeof url !== 'string' || !url.trim()) {
    return NextResponse.json({ error: 'שדה url חסר' }, { status: 400 })
  }

  const validation = validateUrl(url)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const candidates = await getKeyCandidates()

  try {
    const recipe = await importRecipeFromUrl(url, candidates)
    return NextResponse.json(recipe)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[import-url] failed:', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
