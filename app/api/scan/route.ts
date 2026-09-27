import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getKeyCandidates, getModelFor } from '@/lib/ai-providers'
import type { ProviderId } from '@/lib/preview-providers'
import { extractRecipeFromPages } from '@/lib/provider-adapters'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_PAGES = 3
const MAX_BYTES_PER_PAGE = 8 * 1024 * 1024 // 8MB

async function recordOcrScan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string,
  provider: ProviderId,
  status: 'succeeded' | 'failed',
  details?: string,
  model?: string,
) {
  const { error } = await supabase.from('ocr_scan_logs').insert({
    owner_id: ownerId,
    provider,
    model: model ?? provider,
    status,
    details: details ?? null,
  })
  if (error) console.warn('[scan] could not record OCR model:', error.message)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

  const candidates = await getKeyCandidates()
  if (candidates.length === 0) {
    return NextResponse.json(
      { error: 'לא הוגדר ספק AI. עברי להגדרות ה-API להוסיף מפתח.' },
      { status: 503 }
    )
  }

  // Collect image files from the form. Backward-compat: a single `image`
  // field still works (older clients / anyone posting curl). Newer clients
  // send `image1`, `image2`, `image3` for multi-page scans up to MAX_PAGES.
  let pages: Array<{ imageBase64: string; mimeType: string }>
  try {
    const formData = await request.formData()

    const files: File[] = []
    const single = formData.get('image')
    if (single instanceof File) files.push(single)
    for (let i = 1; i <= MAX_PAGES; i++) {
      const v = formData.get(`image${i}`)
      if (v instanceof File) files.push(v)
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'לא נשלחה תמונה' }, { status: 400 })
    }
    if (files.length > MAX_PAGES) {
      return NextResponse.json(
        { error: `אפשר לצלם עד ${MAX_PAGES} דפים בסריקה אחת` },
        { status: 400 }
      )
    }

    pages = []
    for (const f of files) {
      if (f.size > MAX_BYTES_PER_PAGE) {
        return NextResponse.json(
          { error: `תמונה גדולה מדי (מקסימום ${MAX_BYTES_PER_PAGE / 1024 / 1024}MB לדף)` },
          { status: 413 }
        )
      }
      const bytes = await f.arrayBuffer()
      pages.push({
        imageBase64: Buffer.from(bytes).toString('base64'),
        mimeType: f.type || 'image/jpeg',
      })
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'לא ניתן לקרוא את התמונות', detail: String(err) },
      { status: 400 }
    )
  }

  const errors: string[] = []
  for (const { id, key } of candidates) {
    try {
      const model = await getModelFor(id)
      const recipe = await extractRecipeFromPages(id, key, pages, model)
      await recordOcrScan(supabase, user.id, id, 'succeeded', recipe.provider, model)
      return NextResponse.json({
        ...recipe,
        ocr_provider: id,
        ocr_model: model,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[scan] ${id} failed:`, msg)
      await recordOcrScan(supabase, user.id, id, 'failed', msg.slice(0, 500))
      errors.push(`${id}: ${msg}`)
    }
  }

  return NextResponse.json(
    { error: 'החילוץ נכשל בכל הספקים', detail: errors },
    { status: 502 }
  )
}
