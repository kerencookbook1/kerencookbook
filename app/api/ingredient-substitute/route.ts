import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getKeyCandidates } from '@/lib/ai-providers'
import type { ProviderId } from '@/lib/preview-providers'

export const runtime = 'nodejs'
export const maxDuration = 30

const SYSTEM_PROMPT = `אתה עוזר בישול ישראלי. משתמש נותן לך שם של מרכיב וקצת קונטקסט על המתכון, ואתה מציע 2-3 חלופות מעשיות שאפשר להשיג בסופרמרקט ישראלי רגיל.

לכל חלופה תן:
- name: שם החלופה
- ratio: יחס המרה מדויק בעברית ("1:1" / "1 כפית = 3 שיני" / "80% מהכמות המקורית")
- note: טיפ קצר של משפט אחד — מה משתנה בטעם/מרקם/תוצאה

החזר JSON תקף בלבד בדיוק במבנה:
{
  "substitutes": [
    { "name": "...", "ratio": "...", "note": "..." },
    { "name": "...", "ratio": "...", "note": "..." },
    { "name": "...", "ratio": "...", "note": "..." }
  ]
}

חוקים:
- אל תמציא חלופות שלא באמת עובדות
- העדף חלופות שקל למצוא במטבח או בסופר קרוב (ישראל)
- קצר וממוקד — לא תסביר בהרחבה
- אם אין חלופה טובה — החזר מערך ריק: {"substitutes": []}`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

  let body: { ingredient?: unknown; recipeTitle?: unknown; otherIngredients?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף לא תקין' }, { status: 400 })
  }

  const ingredient = typeof body.ingredient === 'string' ? body.ingredient.trim() : ''
  if (!ingredient) {
    return NextResponse.json({ error: 'חסר שדה ingredient' }, { status: 400 })
  }
  const recipeTitle = typeof body.recipeTitle === 'string' ? body.recipeTitle.trim() : ''
  const others = Array.isArray(body.otherIngredients)
    ? (body.otherIngredients as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 20)
    : []

  const userMsg = [
    `המרכיב שצריך חלופה עבורו: ${ingredient}`,
    recipeTitle && `שם המתכון: ${recipeTitle}`,
    others.length > 0 && `שאר המרכיבים במתכון (לקונטקסט): ${others.join(', ')}`,
    'החזר JSON של 2-3 חלופות טובות.',
  ]
    .filter(Boolean)
    .join('\n')

  const candidates = await getKeyCandidates()
  if (candidates.length === 0) {
    return NextResponse.json(
      { error: 'לא הוגדר ספק AI. עברי להגדרות ה-API להוסיף מפתח.' },
      { status: 503 },
    )
  }

  const errors: string[] = []
  for (const { id, key } of candidates) {
    try {
      const suggestions = await callProvider(id, key, userMsg)
      return NextResponse.json(suggestions)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[ingredient-substitute] ${id} failed:`, msg)
      errors.push(`${id}: ${msg}`)
    }
  }

  return NextResponse.json(
    { error: 'הצעת החלופה נכשלה בכל הספקים', detail: errors },
    { status: 502 },
  )
}

type Substitute = { name: string; ratio: string; note?: string }
type Result = { substitutes: Substitute[] }

async function callProvider(id: ProviderId, key: string, userMsg: string): Promise<Result> {
  switch (id) {
    case 'anthropic':
      return callAnthropic(key, userMsg)
    case 'openai':
      return callOpenAI(key, userMsg)
    case 'google':
      return callGoogle(key, userMsg)
    case 'openrouter':
      return callOpenRouter(key, userMsg)
  }
}

async function callAnthropic(key: string, userMsg: string): Promise<Result> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-7',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMsg }],
    }),
    signal: AbortSignal.timeout(20_000),
  })
  if (!r.ok) throw new Error(`anthropic ${r.status}: ${await r.text().catch(() => '')}`)
  const data = await r.json()
  const content = data.content?.[0]?.text ?? ''
  return parseJson(content)
}

async function callOpenAI(key: string, userMsg: string): Promise<Result> {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMsg },
      ],
    }),
    signal: AbortSignal.timeout(20_000),
  })
  if (!r.ok) throw new Error(`openai ${r.status}: ${await r.text().catch(() => '')}`)
  const data = await r.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  return parseJson(content)
}

async function callGoogle(key: string, userMsg: string): Promise<Result> {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userMsg }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(20_000),
    },
  )
  if (!r.ok) throw new Error(`google ${r.status}: ${await r.text().catch(() => '')}`)
  const data = await r.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return parseJson(content)
}

async function callOpenRouter(key: string, userMsg: string): Promise<Result> {
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'https://kerencookbook.vercel.app',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMsg },
      ],
    }),
    signal: AbortSignal.timeout(20_000),
  })
  if (!r.ok) throw new Error(`openrouter ${r.status}: ${await r.text().catch(() => '')}`)
  const data = await r.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  return parseJson(content)
}

/** Pull a valid JSON object out of the model's response, tolerating fenced code blocks. */
function parseJson(text: string): Result {
  const clean = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```\s*$/, '')
    .trim()
  try {
    const obj = JSON.parse(clean)
    const list = Array.isArray(obj?.substitutes) ? obj.substitutes : []
    return {
      substitutes: list
        .filter(
          (s: unknown): s is Substitute =>
            !!s &&
            typeof s === 'object' &&
            typeof (s as { name?: unknown }).name === 'string' &&
            typeof (s as { ratio?: unknown }).ratio === 'string',
        )
        .slice(0, 3)
        .map((s: Substitute) => ({
          name: s.name.trim(),
          ratio: s.ratio.trim(),
          note: typeof s.note === 'string' ? s.note.trim() : undefined,
        })),
    }
  } catch {
    throw new Error('AI החזיר תגובה לא-JSON')
  }
}
