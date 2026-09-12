import type { ProviderId } from './preview-providers'

const CATEGORY_LIST = 'בשר, עוף, דגים, חלבי, צמחוני, פסטה, אורז ודגנים, סלטים, מרקים, מאפים, קינוחים, שתייה, אחר'

const SYSTEM_PROMPT = `אתה מומחה OCR ומחלץ מתכונים מתמונות. התמונה יכולה להיות כרטיסייה מודפסת, דף מחברת בכתב יד, צילום מסך של אתר, או תמונה של מתכון בכל פורמט אחר, בעברית או באנגלית.

**כללי ברזל — עקוב אחריהם בקפדנות:**

1. **קרא את מה שכתוב בפועל בתמונה, מילה במילה.** התייחס לתמונה כמו OCR: העתק בדיוק את הטקסט הנראה, גם אם הוא בכתב יד לא ברור, גם אם יש שגיאות כתיב, גם אם הפורמט מבולגן.

2. **אסור להמציא כלום.** אם לא ברור לך מה כתוב במקום מסוים — כתוב "[לא ברור]" באותו מקום. **אל תשלים ניחושים מהראש שלך על סמך המראה של המאכל.** אם אתה רואה תמונה של עוגת שוקולד אבל אין טקסט קריא — אל תמציא מתכון לעוגת שוקולד.

3. **כתב יד בעברית:** קרא בזהירות רבה. בעברית קל להתבלבל בין: ד/ר, ה/ח, כ/ב, ל/ן, ו/ז, י/נ, ם/ס, ץ/ץ סופית. אם אינך בטוח באות ספציפית, סמן את המילה כ־[לא ברור].

4. **אם אינך מזהה טקסט משמעותי בכלל בתמונה** (תמונה מטושטשת, ריקה, לא של מתכון, כתב לא קריא לחלוטין) — החזר: {"title": null, "raw_text": "מה שראית או ריק", "recognition_failed": true, "reason": "הסבר קצר למה"}. אל תמציא מתכון.

5. שמור על השפה המקורית של הכתוב (בדרך כלל עברית).

6. בחר קטגוריה אחת מהרשימה הבאה בלבד: ${CATEGORY_LIST}. אם לא ברור — בחר "אחר".

**מבנה החזרה — JSON תקף בלבד, ללא טקסט לפני או אחרי:**
{
  "raw_text": "העתקה מדויקת של כל הטקסט שראית בתמונה, כפי שכתוב, שורה־שורה. השדה הזה חובה תמיד — הוא מאפשר למשתמש לוודא שקראת נכון.",
  "recognition_failed": false,
  "title": "שם המתכון או null אם לא זוהה",
  "description": "תיאור קצר או null",
  "category": "אחד מהערכים בדיוק: ${CATEGORY_LIST} — או null אם לא זוהה",
  "servings": מספר מנות או null,
  "prep_minutes": דקות הכנה או null,
  "cook_minutes": דקות בישול או null,
  "author": "שם השף/המחבר אם רשום בתמונה (למשל: 'המתכון של סבתא רות', 'מאת אבי כהן') — אחרת null",
  "ingredients": ["מרכיב שכתוב בתמונה", ...],
  "steps": ["שלב שכתוב בתמונה", ...]
}`

export type ExtractedRecipe = {
  title: string
  description?: string | null
  category?: string | null
  servings?: number | null
  prep_minutes?: number | null
  cook_minutes?: number | null
  /** Name of the chef / recipe author, when detectable from the text. */
  author?: string | null
  ingredients: string[]
  steps: string[]
  provider?: string
  raw_text?: string | null
  recognition_failed?: boolean
  reason?: string | null
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
   EXTRACT — TWO STAGES to avoid recipe hallucination:
     1) OCR-only from the image (no recipe structuring)
     2) Structure the raw OCR text into a recipe
   If stage 1 returns very little text, stop and report failure
   instead of letting stage 2 invent a recipe from nothing.
   ───────────────────────────────────────────────────── */

const OCR_ONLY_PROMPT = `אתה מנוע OCR. תפקידך היחיד: להעתיק בדיוק את הטקסט שרואים בתמונה — מילה במילה, שורה־שורה, בסדר המקורי.

כללים:
1. אל תמצא, אל תפרש, אל תסכם. רק העתק.
2. אם רואים כתב יד לא ברור — כתוב [לא ברור] במקום המילה. אל תנחש.
3. אם התמונה ריקה, מטושטשת, לא מכילה טקסט קריא, או אינה של מתכון — החזר {"raw_text": "", "readable": false, "reason": "הסבר קצר"}.
4. אין לך מושג מה נמצא בתמונה חוץ ממה שכתוב שם. אתה לא רואה תמונות של אוכל, רק טקסט.
5. שמור על השפה המקורית.

החזר JSON תקף בלבד:
{
  "raw_text": "כל הטקסט, שורה־שורה עם \\n בין שורות",
  "readable": true | false,
  "reason": "אם readable=false, למה"
}`

type OcrResult = { raw_text: string; readable: boolean; reason?: string | null }

function parseOcrResult(text: string): OcrResult {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  try {
    const parsed = JSON.parse(cleaned)
    return {
      raw_text: typeof parsed.raw_text === 'string' ? parsed.raw_text : '',
      readable: parsed.readable === true,
      reason: typeof parsed.reason === 'string' ? parsed.reason : null,
    }
  } catch {
    // Model returned plain text — treat as raw OCR
    return { raw_text: text.trim(), readable: text.trim().length > 15 }
  }
}

function isTooSparseToBeARecipe(rawText: string): boolean {
  const chars = rawText.replace(/\s/g, '').length
  return chars < 30  // clearly not enough to be a recipe
}

/** Ratio of [לא ברור] markers to total tokens. High ratio = OCR failed. */
function unclearRatio(rawText: string): number {
  const unclearMatches = rawText.match(/\[לא ברור\]/g) ?? []
  const tokens = rawText.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return 1
  return unclearMatches.length / tokens.length
}

/**
 * Word-overlap validation: check that ingredients+steps generated by
 * stage 2 actually appear in the raw OCR text. If most of the words
 * don't appear, the structuring stage hallucinated.
 * Returns a score 0..1 (1 = all output words are grounded in OCR).
 */
function groundingScore(recipe: { ingredients: string[]; steps: string[]; title: string }, rawText: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,;:!?()\-\/\d]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const rawTokens = new Set(
    normalize(rawText).split(' ').filter((w) => w.length >= 2)
  )
  const generated = [recipe.title, ...recipe.ingredients, ...recipe.steps].join(' ')
  const generatedTokens = normalize(generated).split(' ').filter((w) => w.length >= 2)
  if (generatedTokens.length === 0) return 1
  const matched = generatedTokens.filter((w) => {
    // Match on substring both directions to allow inflections / attached particles
    for (const t of rawTokens) if (t.includes(w) || w.includes(t)) return true
    return false
  })
  return matched.length / generatedTokens.length
}

export async function extractRecipe(
  id: ProviderId,
  key: string,
  imageBase64: string,
  mimeType: string
): Promise<ExtractedRecipe> {
  // ─── Stage 1: pure OCR ───
  const ocr = await ocrImageWithProvider(id, key, imageBase64, mimeType)

  // Gate A — nothing readable at all
  if (!ocr.readable || isTooSparseToBeARecipe(ocr.raw_text)) {
    return {
      title: 'זיהוי נכשל',
      description: null,
      category: null,
      servings: null,
      prep_minutes: null,
      cook_minutes: null,
      ingredients: [],
      steps: [],
      raw_text: ocr.raw_text || '',
      recognition_failed: true,
      reason: ocr.reason ?? 'לא זוהה טקסט משמעותי בתמונה. נסי שוב עם תאורה טובה יותר וזווית ישרה.',
      provider: `${id}:ocr-only`,
    }
  }

  // Gate B — too many [לא ברור] markers → OCR gave up on most of the text
  const unclear = unclearRatio(ocr.raw_text)
  if (unclear > 0.35) {
    return {
      title: 'זיהוי חלקי מדי',
      description: null,
      category: null,
      servings: null,
      prep_minutes: null,
      cook_minutes: null,
      ingredients: [],
      steps: [],
      raw_text: ocr.raw_text,
      recognition_failed: true,
      reason: `יותר מ־${Math.round(unclear * 100)}% מהמילים לא היו קריאות. הטקסט למטה הוא מה שכן נקרא — את יכולה למלא את השדות ידנית או לצלם מחדש בתאורה טובה יותר.`,
      provider: `${id}:ocr-low-confidence`,
    }
  }

  // ─── Stage 2: structure the OCR text into a recipe ───
  const structured = await extractRecipeFromText(id, key, ocr.raw_text, '')

  // Gate C — structuring stage output doesn't match the OCR text
  const score = groundingScore(structured, ocr.raw_text)
  if (score < 0.4) {
    return {
      title: 'זיהוי לא אמין',
      description: null,
      category: null,
      servings: null,
      prep_minutes: null,
      cook_minutes: null,
      ingredients: [],
      steps: [],
      raw_text: ocr.raw_text,
      recognition_failed: true,
      reason: `ה־AI ניסה לבנות מתכון אבל השדות שהוא הציע לא תואמים למה שנקרא מהתמונה (התאמה: ${Math.round(score * 100)}%). זה סימן להזיה. הטקסט למטה הוא מה שנקרא בפועל — מלאי ידנית מתוכו.`,
      provider: `${id}:hallucination-detected`,
    }
  }

  return {
    ...structured,
    raw_text: ocr.raw_text,
    recognition_failed: false,
    reason: null,
    provider: `${id}:two-stage (grounding: ${Math.round(score * 100)}%)`,
  }
}

async function ocrImageWithProvider(id: ProviderId, key: string, imageBase64: string, mimeType: string): Promise<OcrResult> {
  switch (id) {
    case 'anthropic': return ocrWithAnthropic(key, imageBase64, mimeType)
    case 'openai':    return ocrWithOpenAI(key, imageBase64, mimeType)
    case 'google':    return ocrWithGoogle(key, imageBase64, mimeType)
  }
}

async function ocrWithAnthropic(key: string, imageBase64: string, mimeType: string): Promise<OcrResult> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-7',  // strongest available — better handwriting recognition
      max_tokens: 4096,
      temperature: 0,
      system: OCR_ONLY_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
            { type: 'text', text: 'העתק את הטקסט מהתמונה. אל תפרש, אל תמציא.' },
          ],
        },
      ],
    }),
  })
  if (!r.ok) {
    // If Opus is not available for this key, fall back to Sonnet
    if (r.status === 404 || r.status === 400) {
      return ocrWithAnthropicFallback(key, imageBase64, mimeType)
    }
    throw new Error(`Anthropic ${r.status}: ${extractApiMessage(await r.text().catch(() => ''))}`)
  }
  const data = await r.json()
  const content = data.content?.[0]?.text
  if (!content) throw new Error('Empty OCR response from Anthropic')
  return parseOcrResult(content)
}

async function ocrWithAnthropicFallback(key: string, imageBase64: string, mimeType: string): Promise<OcrResult> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      temperature: 0,
      system: OCR_ONLY_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
            { type: 'text', text: 'העתק את הטקסט מהתמונה. אל תפרש, אל תמציא.' },
          ],
        },
      ],
    }),
  })
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${extractApiMessage(await r.text().catch(() => ''))}`)
  const data = await r.json()
  const content = data.content?.[0]?.text
  if (!content) throw new Error('Empty OCR response from Anthropic')
  return parseOcrResult(content)
}

async function ocrWithOpenAI(key: string, imageBase64: string, mimeType: string): Promise<OcrResult> {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: OCR_ONLY_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'העתק את הטקסט מהתמונה. אל תפרש, אל תמציא. החזר JSON תקף.' },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: 'high' } },
          ],
        },
      ],
    }),
  })
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${extractApiMessage(await r.text().catch(() => ''))}`)
  const data = await r.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty OCR response from OpenAI')
  return parseOcrResult(content)
}

async function ocrWithGoogle(key: string, imageBase64: string, mimeType: string): Promise<OcrResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(key)}`
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: OCR_ONLY_PROMPT }] },
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: 'העתק את הטקסט מהתמונה. אל תפרש, אל תמציא. החזר JSON תקף.' },
          ],
        },
      ],
      generationConfig: { responseMimeType: 'application/json', temperature: 0 },
    }),
  })
  if (!r.ok) throw new Error(`Google ${r.status}: ${extractApiMessage(await r.text().catch(() => ''))}`)
  const data = await r.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error('Empty OCR response from Google')
  return parseOcrResult(content)
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

6. חפש בטקסט את שם השף/המחבר של המתכון. שמות נפוצים בטקסטים ישראלים: "המתכון של [שם]", "מאת [שם]", "השף [שם]", "מטבחה של [שם]". דוגמאות: "רון יוחננוף", "אבי כהן", "אורלי פלאי-ברונשטיין", "יותם אוטולנגי". אם אין שם ברור — החזר null.

החזר JSON תקף בלבד במבנה הבא, ללא טקסט לפני או אחרי:
{
  "title": "שם המתכון (חובה)",
  "description": "תיאור קצר או null",
  "category": "אחד מהערכים הבאים בדיוק: ${CATEGORY_LIST}",
  "servings": מספר מנות או null,
  "prep_minutes": דקות הכנה או null,
  "cook_minutes": דקות בישול או null,
  "author": "שם השף/המחבר או null",
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
      max_tokens: 4096,
      temperature: 0,
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
      temperature: 0,
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
      generationConfig: { responseMimeType: 'application/json', temperature: 0 },
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
  const rawTitle = typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : null
  return {
    title: rawTitle ?? 'מתכון ללא שם',
    description: parsed.description ?? null,
    category: typeof parsed.category === 'string' ? parsed.category : null,
    servings: typeof parsed.servings === 'number' ? parsed.servings : null,
    prep_minutes: typeof parsed.prep_minutes === 'number' ? parsed.prep_minutes : null,
    cook_minutes: typeof parsed.cook_minutes === 'number' ? parsed.cook_minutes : null,
    ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients.map(String) : [],
    steps: Array.isArray(parsed.steps) ? parsed.steps.map(String) : [],
    raw_text: typeof parsed.raw_text === 'string' ? parsed.raw_text : null,
    recognition_failed: parsed.recognition_failed === true || rawTitle === null,
    reason: typeof parsed.reason === 'string' ? parsed.reason : null,
  }
}
