import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getKeyCandidates } from '@/lib/ai-providers'
import { extractRecipe } from '@/lib/provider-adapters'

export const runtime = 'nodejs'
export const maxDuration = 60

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

  // Parse image
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
