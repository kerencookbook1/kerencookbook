import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getKeyCandidates } from '@/lib/ai-providers'

export const runtime = 'nodejs'
export const maxDuration = 60

const requestSchema = z.object({
  mode: z.enum(['menu', 'chat']).default('menu'),
  ingredients: z.array(z.string().trim().min(1).max(120)).min(1).max(80),
  recipes: z.array(z.object({
    title: z.string().trim().min(1).max(160),
    matchPercent: z.number().min(0).max(100),
    missing: z.array(z.string().trim().max(80)).max(30),
  })).max(20).default([]),
  conversation: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    text: z.string().trim().min(1).max(1000),
  })).max(12).default([]),
  message: z.string().trim().max(1000).optional(),
})

const systemPrompt = `את שף אישי ישראלי ועוזרת בישול חכמה. קבלי רשימת מוצרים שיש למשתמשת בבית ובני לה תפריט בישול מעשי.
העדיפי שימוש במוצרים שסופקו. מותר להציע עד 3 מוצרים חסרים בסיסיים לכל היותר, אבל צייני אותם במפורש.
החזירי JSON תקין בלבד, בלי markdown ובלי טקסט לפני או אחרי, במבנה:
{
  "message": "תשובה קצרה וחמה בעברית למשתמשת",
  "meals": [
    {
      "meal": "ארוחת בוקר|ארוחת צהריים|ארוחת ערב",
      "title": "שם המנה",
      "description": "תיאור קצר",
      "ingredients": ["כמות ומרכיב"],
      "steps": ["שלב הכנה"],
      "missingIngredients": ["מוצר שחסר, אם יש"]
    }
  ]
}
כל מתכון חייב לכלול 3 עד 8 מרכיבים ו-2 עד 6 שלבי הכנה. כתבי בעברית, במידות מטריות, והיי ברורה לגבי מוצרים חסרים.`

const chatSystemPrompt = `את שף אישי ישראלי שמנהלת שיחה קצרה, חמה ומעשית בעברית. עני לפי המוצרים שיש למשתמשת בבית. אל תטעני שמצאת מתכון בספרייה אם לא נמסר לך שהוא קיים. כשמבקשים מתכון חדש, תני מתכון קצר עם מרכיבים ושלבים. כשחסר מוצר, צייני אותו. החזירי JSON תקין בלבד במבנה {"reply":"תשובה בעברית"}.`

const mealSchema = z.object({
  meal: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(500).default(''),
  ingredients: z.array(z.string().trim().min(1).max(160)).min(1).max(12),
  steps: z.array(z.string().trim().min(1).max(500)).min(1).max(10),
  missingIngredients: z.array(z.string().trim().min(1).max(120)).max(8).default([]),
})

function extractMessage(body: string): string {
  try {
    const parsed = JSON.parse(body)
    return parsed?.error?.message || parsed?.message || body.slice(0, 160)
  } catch {
    return body.slice(0, 160)
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו JSON תקין' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: 'רשימת המוצרים אינה תקינה' }, { status: 400 })

  const candidates = await getKeyCandidates()
  const candidate = candidates.find((item) => item.id === 'openai') ?? candidates[0]
  if (!candidate) return NextResponse.json({ error: 'לא נמצא ספק AI פעיל. הגדירי מפתח OpenAI בהגדרות.' }, { status: 503 })
  if (candidate.id !== 'openai') return NextResponse.json({ error: `הספק הפעיל הוא ${candidate.id}, ובניית תפריט זמינה כרגע דרך OpenAI.` }, { status: 503 })

  const userPrompt = [
    `המוצרים שיש לי בבית:\n${parsed.data.ingredients.map((item) => `- ${item}`).join('\n')}`,
    parsed.data.recipes.length > 0
      ? `מתכונים קיימים בספרייה שכדאי לשקול:\n${parsed.data.recipes.map((recipe) => `- ${recipe.title} (${recipe.matchPercent}% התאמה${recipe.missing.length ? `, חסר: ${recipe.missing.join(', ')}` : ''})`).join('\n')}`
      : 'אין כרגע מתכונים קיימים בספרייה שמתאימים מספיק.',
    parsed.data.conversation.length > 0
      ? `המשך השיחה:\n${parsed.data.conversation.map((message) => `${message.role === 'user' ? 'משתמשת' : 'עוזרת'}: ${message.text}`).join('\n')}`
      : '',
    parsed.data.message ? `השאלה הנוכחית של המשתמשת:\n${parsed.data.message}` : '',
  ].filter(Boolean).join('\n\n')

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${candidate.key}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: parsed.data.mode === 'chat' ? chatSystemPrompt : systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(50_000),
    })
    if (!response.ok) return NextResponse.json({ error: `OpenAI ${response.status}: ${extractMessage(await response.text())}` }, { status: 502 })
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) return NextResponse.json({ error: 'OpenAI החזיר תשובה ריקה' }, { status: 502 })
    const result = JSON.parse(content) as { message?: string; reply?: string; meals?: unknown[] }
    if (parsed.data.mode === 'chat') {
      if (!result.reply || typeof result.reply !== 'string') return NextResponse.json({ error: 'לא התקבלה תשובה תקינה מה‑AI' }, { status: 502 })
      return NextResponse.json({ reply: result.reply, provider: 'openai:gpt-4o' })
    }
    const meals = z.array(mealSchema).max(3).safeParse(result.meals)
    if (!meals.success || meals.data.length === 0) return NextResponse.json({ error: 'ה‑AI החזיר מבנה מתכון לא תקין. נסי שוב.' }, { status: 502 })
    return NextResponse.json({
      message: typeof result.message === 'string' ? result.message : 'הרכבתי לך תפריט לפי המוצרים שיש בבית.',
      meals: meals.data,
      provider: 'openai:gpt-4o',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'שגיאה לא ידועה'
    return NextResponse.json({ error: `לא הצלחתי לדבר עם OpenAI: ${message}` }, { status: 502 })
  }
}
