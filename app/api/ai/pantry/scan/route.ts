import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getKeyCandidates } from '@/lib/ai-providers'

export const runtime = 'nodejs'
export const maxDuration = 60

const requestSchema = z.object({
  images: z.array(z.object({
    data: z.string().startsWith('data:image/').max(4_500_000),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  })).min(1).max(10),
})

const systemPrompt = `את עוזרת לזיהוי מוצרי מזון מתמונות של מקרר, מזווה או משטח מטבח.
זהי רק מוצרים שנראים בבירור בתמונה. אל תנחשי מוצר אם אי אפשר לקרוא את האריזה או לזהות אותו בביטחון.
אחדִי כפילויות בין התמונות. החזירי שמות שימושיים בעברית, למשל "חלב 3%", "ביצים", "עגבניות שרי".
אל תכללי כלי מטבח, אריזות ריקות, מותגים בלבד או מוצרים שאינם מזון.
החזירי JSON תקין בלבד במבנה:
{"items":[{"name":"שם מוצר","confidence":"high|medium"}]}`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 }) }
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'אפשר לשלוח עד 5 תמונות מזון תקינות' }, { status: 400 })

  const candidates = await getKeyCandidates()
  const candidate = candidates.find((item) => item.id === 'openai')
  if (!candidate) return NextResponse.json({ error: 'לא נמצא מפתח OpenAI. הגדירי אותו בהגדרות החיבורים.' }, { status: 503 })

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${candidate.key}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'זהי את מוצרי המזון בכל התמונות, אחדִי כפילויות, והחזירי JSON בלבד.' },
            ...parsed.data.images.map((image) => ({ type: 'image_url', image_url: { url: image.data, detail: 'high' } })),
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(50_000),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    return NextResponse.json({ error: `OpenAI לא הצליח לנתח את התמונות (${response.status})`, detail: text.slice(0, 200) }, { status: 502 })
  }
  try {
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    const result = JSON.parse(content) as { items?: Array<{ name?: string; confidence?: string }> }
    const items = (result.items ?? [])
      .filter((item) => typeof item.name === 'string' && item.name.trim() && item.confidence !== 'low')
      .map((item) => item.name!.trim())
      .filter((name, index, all) => all.findIndex((other) => other.toLowerCase() === name.toLowerCase()) === index)
      .slice(0, 60)
    return NextResponse.json({ items, provider: 'openai:gpt-4o-vision' })
  } catch {
    return NextResponse.json({ error: 'ה‑AI החזיר תשובה שלא ניתן לקרוא' }, { status: 502 })
  }
}
