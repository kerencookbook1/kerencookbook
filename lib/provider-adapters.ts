import type { ProviderId } from './preview-providers'

const CATEGORY_LIST = 'בשר, עוף, דגים, חלבי, צמחוני, פסטה, אורז ודגנים, סלטים, מרקים, מאפים, קינוחים, שתייה, אחר'

const SYSTEM_PROMPT = `אתה מומחה בזיהוי מתכונים מתמונות של דפי כרטיסייה, מחברות ומקורות אינטרנט.
המשתמש מעלה תמונה עם טקסט מתכון בעברית או אנגלית. תפקידך:

1. חלץ את כל הטקסט מהתמונה במדויק.
2. נתח אותו למבנה מתכון מסודר.
3. שמור על השפה המקורית (בדרך כלל עברית).
4. אם משהו לא ברור בתמונה — עדיף להשמיט מאשר להמציא.
5. בחר קטגוריה אחת מהרשימה הבאה בלבד: ${CATEGORY_LIST}. אם לא ברור — בחר "אחר".

החזר JSON תקף בלבד במבנה הבא, ללא טקסט לפני או אחרי:
{
  "title": "שם המתכון (חובה)",
  "description": "תיאור קצר או null",
  "category": "אחד מהערכים הבאים בדיוק: ${CATEGORY_LIST}",
  "servings": מספר מנות או null,
  "prep_minutes": דקות הכנה או null,
  "cook_minutes": דקות בישול או null,
  "ingredients": ["מרכיב עם כמות ויחידה", ...],
  "steps": ["שלב 1", "שלב 2", ...]
}`

export type ExtractedRecipe = {
  title: string
  description?: string | null
  category?: string | null
  servings?: number | null
  prep_minutes?: number | null
  cook_minutes?: number | null
  ingredients: string[]
  steps: string[]
  provider?: string
}

/* ─────────────────────────────────────────────────────
   TEST — quick ping to verify the key works
   ───────────────────────────────────────────────────── */

export type TestResult = { ok: true; model: string } | { ok: false; error: string }

export async function testProvider(id: ProviderId, key: string): Promise<TestResult> {
  try {
    switch (id) {
      case 'openai':
        return await testOpenAI(key)
      case 'anthropic':
        return await testAnthropic(key)
      case 'google':
        return await testGoogle(key)
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

async function testOpenAI(key: string): Promise<TestResult> {
  const r = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  })
  if (r.ok) {
    return { ok: true, model: 'gpt-4o (vision)' }
  }
  const body = await r.text().catch(() => '')
  return { ok: false, error: `HTTP ${r.status}: ${extractApiMessage(body) || 'לא מורשה'}` }
}

async function testAnthropic(key: string): Promise<TestResult> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8,
      messages: [{ role: 'user', content: 'pong' }],
    }),
  })
  if (r.ok) {
    return { ok: true, model: 'claude-sonnet-4-6 (vision)' }
  }
  const body = await r.text().catch(() => '')
  return { ok: false, error: `HTTP ${r.status}: ${extractApiMessage(body) || 'לא מורשה'}` }
}

async function testGoogle(key: string): Promise<TestResult> {
  // Use the actual generateContent endpoint — /v1beta/models accepts some invalid
  // keys, so listing models is not a strict enough check.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(key)}`
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
      generationConfig: { maxOutputTokens: 8 },
    }),
  })
  if (r.ok) {
    return { ok: true, model: 'gemini-3.6-flash (vision)' }
  }
  const body = await r.text().catch(() => '')
  return { ok: false, error: `HTTP ${r.status}: ${extractApiMessage(body) || 'לא מורשה'}` }
}

function extractApiMessage(body: string): string {
  try {
    const parsed = JSON.parse(body)
    return parsed?.error?.message || parsed?.message || ''
  } catch {
    return body.slice(0, 140)
  }
}

/* ─────────────────────────────────────────────────────
   EXTRACT — full OCR + parsing to Recipe JSON
   ───────────────────────────────────────────────────── */

export async function extractRecipe(
  id: ProviderId,
  key: string,
  imageBase64: string,
  mimeType: string
): Promise<ExtractedRecipe> {
  switch (id) {
    case 'openai':
      return extractWithOpenAI(key, imageBase64, mimeType)
    case 'anthropic':
      return extractWithAnthropic(key, imageBase64, mimeType)
    case 'google':
      return extractWithGoogle(key, imageBase64, mimeType)
  }
}

async function extractWithAnthropic(key: string, imageBase64: string, mimeType: string): Promise<ExtractedRecipe> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
            { type: 'text', text: 'חלץ את המתכון מהתמונה והחזר JSON תקף.' },
          ],
        },
      ],
    }),
  })
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${extractApiMessage(await r.text().catch(() => ''))}`)
  const data = await r.json()
  const content = data.content?.[0]?.text
  if (!content) throw new Error('Empty response from Anthropic')
  return { ...parseJsonFromModelText(content), provider: 'anthropic:claude-sonnet-4-6' }
}

async function extractWithOpenAI(key: string, imageBase64: string, mimeType: string): Promise<ExtractedRecipe> {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'חלץ את המתכון מהתמונה והחזר JSON תקף.' },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          ],
        },
      ],
    }),
  })
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${extractApiMessage(await r.text().catch(() => ''))}`)
  const data = await r.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from OpenAI')
  return { ...parseJsonFromModelText(content), provider: 'openai:gpt-4o' }
}

async function extractWithGoogle(key: string, imageBase64: string, mimeType: string): Promise<ExtractedRecipe> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(key)}`
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: 'חלץ את המתכון מהתמונה והחזר JSON תקף.' },
          ],
        },
      ],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  })
  if (!r.ok) throw new Error(`Google ${r.status}: ${extractApiMessage(await r.text().catch(() => ''))}`)
  const data = await r.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error('Empty response from Google')
  return { ...parseJsonFromModelText(content), provider: 'google:gemini-3.6-flash' }
}

/* ─────────────────────────────────────────────────────
   EXTRACT FROM TEXT — for URL import fallback
   ───────────────────────────────────────────────────── */

const TEXT_SYSTEM_PROMPT = `אתה מומחה בזיהוי מתכונים מטקסט של דפי אתר.
המשתמש שולח את התוכן הטקסטואלי של דף מתכון (כל התוכן של ה-HTML לאחר הסרת תגים).
תפקידך:
1. מצא את המתכון בתוך הטקסט (התעלם מפרסומות, ניווט, הערות, קישורים אחרים).
2. חלץ אותו למבנה מסודר.
3. שמור על השפה המקורית (עברית או אנגלית).
4. אם משהו לא ברור — עדיף להשמיט מאשר להמציא.
5. בחר קטגוריה אחת מהרשימה הבאה בלבד: ${CATEGORY_LIST}. אם לא ברור — בחר "אחר".

החזר JSON תקף בלבד במבנה הבא, ללא טקסט לפני או אחרי:
{
  "title": "שם המתכון (חובה)",
  "description": "תיאור קצר או null",
  "category": "אחד מהערכים הבאים בדיוק: ${CATEGORY_LIST}",
  "servings": מספר מנות או null,
  "prep_minutes": דקות הכנה או null,
  "cook_minutes": דקות בישול או null,
  "ingredients": ["מרכיב עם כמות ויחידה", ...],
  "steps": ["שלב 1", "שלב 2", ...]
}`

export async function extractRecipeFromText(
  id: ProviderId,
  key: string,
  text: string,
  sourceUrl: string
): Promise<ExtractedRecipe> {
  const userMsg = `URL של הדף: ${sourceUrl}\n\nתוכן הדף (טקסט בלבד):\n\n${text}\n\nחלץ מתוך זה את המתכון והחזר JSON תקף בלבד.`
  switch (id) {
    case 'anthropic':
      return extractTextWithAnthropic(key, userMsg)
    case 'openai':
      return extractTextWithOpenAI(key, userMsg)
    case 'google':
      return extractTextWithGoogle(key, userMsg)
  }
}

async function extractTextWithAnthropic(key: string, userMsg: string): Promise<ExtractedRecipe> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: TEXT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMsg }],
    }),
  })
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${extractApiMessage(await r.text().catch(() => ''))}`)
  const data = await r.json()
  const content = data.content?.[0]?.text
  if (!content) throw new Error('Empty response from Anthropic')
  return { ...parseJsonFromModelText(content), provider: 'anthropic:claude-sonnet-4-6' }
}

async function extractTextWithOpenAI(key: string, userMsg: string): Promise<ExtractedRecipe> {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: TEXT_SYSTEM_PROMPT },
        { role: 'user', content: userMsg },
      ],
    }),
  })
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${extractApiMessage(await r.text().catch(() => ''))}`)
  const data = await r.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from OpenAI')
  return { ...parseJsonFromModelText(content), provider: 'openai:gpt-4o' }
}

async function extractTextWithGoogle(key: string, userMsg: string): Promise<ExtractedRecipe> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(key)}`
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: TEXT_SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userMsg }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  })
  if (!r.ok) throw new Error(`Google ${r.status}: ${extractApiMessage(await r.text().catch(() => ''))}`)
  const data = await r.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error('Empty response from Google')
  return { ...parseJsonFromModelText(content), provider: 'google:gemini-3.6-flash' }
}

function parseJsonFromModelText(text: string): Omit<ExtractedRecipe, 'provider'> {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
  const parsed = JSON.parse(cleaned)
  return {
    title: String(parsed.title ?? 'מתכון ללא שם'),
    description: parsed.description ?? null,
    category: typeof parsed.category === 'string' ? parsed.category : null,
    servings: typeof parsed.servings === 'number' ? parsed.servings : null,
    prep_minutes: typeof parsed.prep_minutes === 'number' ? parsed.prep_minutes : null,
    cook_minutes: typeof parsed.cook_minutes === 'number' ? parsed.cook_minutes : null,
    ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients.map(String) : [],
    steps: Array.isArray(parsed.steps) ? parsed.steps.map(String) : [],
  }
}
