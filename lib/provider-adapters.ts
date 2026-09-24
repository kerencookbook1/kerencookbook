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
  "ingredientGroups": [
    {"title": "כותרת החלק (למשל 'לעוגה', 'לרוטב', 'לפירורים') — או null אם אין חלקים נפרדים", "items": ["מרכיב עם כמות ויחידה", ...]},
    {"title": "כותרת חלק נוסף", "items": ["..."]}
  ],
  "steps": [
    {"title": "שם הסעיף אם השלב שייך לחלק מסוים (למשל 'לפירורים', 'הכנת הרוטב') — או null", "body": "תיאור השלב כפי שכתוב"},
    ...
  ]
}
הערות חשובות: אם המתכון פשוט ללא חלקים, השתמש ב-ingredientGroups עם פריט אחד שה-title שלו הוא null. אל תמציא חלוקה לחלקים אם אין כזאת בפועל.`

export type IngredientGroup = {
  title: string | null
  items: string[]
}

export type ExtractedRecipe = {
  title: string
  description?: string | null
  category?: string | null
  servings?: number | null
  prep_minutes?: number | null
  cook_minutes?: number | null
  /** Name of the chef / recipe author, when detectable from the text. */
  author?: string | null
  /** Flat ingredient strings — derived from ingredientGroups, kept for backward compat. */
  ingredients: string[]
  /** Grouped ingredients — always present (at least one group with title=null for simple recipes). */
  ingredientGroups: IngredientGroup[]
  /** Structured steps — each may carry an optional section title. */
  steps: Array<{ title: string | null; body: string }>
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
      ingredientGroups: [],
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
      ingredientGroups: [],
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
  const score = groundingScore(
    { title: structured.title, ingredients: structured.ingredients, steps: structured.steps.map((s) => s.body) },
    ocr.raw_text,
  )
  if (score < 0.4) {
    return {
      title: 'זיהוי לא אמין',
      description: null,
      category: null,
      servings: null,
      prep_minutes: null,
      cook_minutes: null,
      ingredients: [],
      ingredientGroups: [],
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

/**
 * Multi-page OCR pipeline. Runs the OCR stage on each page in parallel,
 * concatenates the raw texts with clear page markers, and hands the union
 * to the same text-structuring stage the single-page path uses.
 *
 * Cook-book cards frequently span two or three sides: ingredients on one,
 * instructions on the next, notes on a third. Sending them one-by-one
 * through the single-page endpoint would give three disjoint (and mostly
 * empty) recipes; combining them upstream keeps the structuring step
 * working from a complete document.
 */
export async function extractRecipeFromPages(
  id: ProviderId,
  key: string,
  pages: Array<{ imageBase64: string; mimeType: string }>,
): Promise<ExtractedRecipe> {
  if (pages.length === 0) throw new Error('אין דפים לסריקה')
  if (pages.length === 1) return extractRecipe(id, key, pages[0].imageBase64, pages[0].mimeType)

  // ─── Stage 1: OCR each page in parallel ───
  const ocrResults = await Promise.all(
    pages.map((p) => ocrImageWithProvider(id, key, p.imageBase64, p.mimeType)),
  )

  const totalPages = pages.length
  const combinedText = ocrResults
    .map((r, i) => `─── דף ${i + 1} מתוך ${totalPages} ───\n${r.raw_text || '(לא הוצא טקסט מהדף)'}`)
    .join('\n\n')

  // Recipe is considered readable if ANY page was readable and the combined
  // text isn't too sparse. A single unreadable page shouldn't kill the whole
  // batch as long as the others have real content.
  const anyReadable = ocrResults.some((r) => r.readable)
  if (!anyReadable || isTooSparseToBeARecipe(combinedText)) {
    return {
      title: 'זיהוי נכשל',
      description: null,
      category: null,
      servings: null,
      prep_minutes: null,
      cook_minutes: null,
      ingredients: [],
      ingredientGroups: [],
      steps: [],
      raw_text: combinedText,
      recognition_failed: true,
      reason: 'לא זוהה טקסט משמעותי באף אחד מהדפים. נסי שוב עם תאורה טובה יותר וזווית ישרה.',
      provider: `${id}:ocr-only:${totalPages}pages`,
    }
  }

  const unclear = unclearRatio(combinedText)
  if (unclear > 0.35) {
    return {
      title: 'זיהוי חלקי מדי',
      description: null,
      category: null,
      servings: null,
      prep_minutes: null,
      cook_minutes: null,
      ingredients: [],
      ingredientGroups: [],
      steps: [],
      raw_text: combinedText,
      recognition_failed: true,
      reason: `יותר מ־${Math.round(unclear * 100)}% מהמילים בכל הדפים לא היו קריאות. הטקסט למטה הוא מה שכן נקרא — את יכולה למלא את השדות ידנית או לצלם מחדש בתאורה טובה יותר.`,
      provider: `${id}:ocr-low-confidence:${totalPages}pages`,
    }
  }

  // ─── Stage 2: structure the combined text into a single recipe ───
  const structured = await extractRecipeFromText(id, key, combinedText, '')

  const score = groundingScore(
    { title: structured.title, ingredients: structured.ingredients, steps: structured.steps.map((s) => s.body) },
    combinedText,
  )
  if (score < 0.4) {
    return {
      title: 'זיהוי לא אמין',
      description: null,
      category: null,
      servings: null,
      prep_minutes: null,
      cook_minutes: null,
      ingredients: [],
      ingredientGroups: [],
      steps: [],
      raw_text: combinedText,
      recognition_failed: true,
      reason: `ה־AI ניסה לבנות מתכון מ־${totalPages} דפים אבל השדות שהוא הציע לא תואמים למה שנקרא (התאמה: ${Math.round(score * 100)}%). זה סימן להזיה. הטקסט למטה הוא מה שנקרא בפועל — מלאי ידנית מתוכו.`,
      provider: `${id}:hallucination-detected:${totalPages}pages`,
    }
  }

  return {
    ...structured,
    raw_text: combinedText,
    recognition_failed: false,
    reason: null,
    provider: `${id}:two-stage:${totalPages}pages (grounding: ${Math.round(score * 100)}%)`,
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

7. **שמור זמנים בתוך השלבים** — כל אזכור של דקות/שעות/שניות בטקסט של השלב חובה להישאר בו כמו שהוא. למשל "לטגן 3 דקות" חייב להישאר בתוך גוף השלב עם המספר והיחידה — כדי שהמערכת תצור כפתור טיימר לחיצי. אם השלב מתאר שני משכי-זמן שונים ("לטגן 3 דקות, להפוך ולטגן עוד 2 דקות") — שני הזמנים חייבים להיות בטקסט.

8. **פרק הוראות ארוכות לשלבים אמיתיים** — כל שלב מכיל פעולה אחת או שתיים לוגיות. אל תשאיר פסקה של 10 משפטים כשלב אחד; פצל אותה למספר שלבים ממוספרים.

9. **אסור להכניס לשלבים או למרכיבים את הדברים הבאים** — האתר שממנו הטקסט נלקח מוסיף רעש. פסלי אותו:
   ❌ קרדיטים ("צילום: ...", "צלם: ...", "עורך: ...", "כתבה: ...", "מגיש/ה: ...", "by ...", "מאת ...")
   ❌ תפריטים וניווט ("עמוד הבית", "מנות ראשונות", "About Us", "Contact", "Home", "Recipes")
   ❌ קריאות לפעולה ("קרא עוד", "לחצי כאן", "שתפי בפייסבוק", "read more", "click here")
   ❌ אנגלית אם המתכון כולו בעברית (אלא אם זהו שם מרכיב כמו "olive oil")
   ❌ תגיות ("#עוגה", "#קינוחים") ו-hashtags
   ❌ URLs, כתובות מייל, מספרי טלפון
   ❌ מספרי תגובות ("15 תגובות", "5 kudos")
   ❌ תאריכים של פרסום ("15 בינואר 2024")
   שלב תקין הוא **פעולה של בישול** (לחמם, לערבב, להוסיף, לאפות, לבשל, לצלות, לחתוך וכו').

החזר JSON תקף בלבד במבנה הבא, ללא טקסט לפני או אחרי:
{
  "title": "שם המתכון (חובה)",
  "description": "תיאור קצר או null",
  "category": "אחד מהערכים הבאים בדיוק: ${CATEGORY_LIST}",
  "servings": מספר מנות או null,
  "prep_minutes": דקות הכנה או null,
  "cook_minutes": דקות בישול או null,
  "author": "שם השף/המחבר או null",
  "ingredientGroups": [
    {"title": "כותרת החלק (למשל 'לרוטב', 'לבצק', 'לציפוי') — null אם אין חלקים נפרדים", "items": ["מרכיב עם כמות ויחידה", ...]},
    {"title": "חלק נוסף אם קיים", "items": ["..."]}
  ],
  "steps": [
    {"title": "שם הסעיף אם השלב שייך לחלק מסוים (למשל 'הכנת הרוטב') — null אם אין", "body": "תיאור מלא של השלב"},
    ...
  ]
}
חשוב: אם המתכון פשוט ללא חלקים נפרדים, השתמש ב-ingredientGroups עם אובייקט אחד בלבד שה-title שלו הוא null. אל תמציא חלוקה לחלקים אם אין כזאת בטקסט.`

/**
 * Extra prompt appended when the caller wants the output localized to Hebrew
 * with Israeli metric units — used for TikTok / Instagram / YouTube imports
 * where the caption is often English. The URL importer for Israeli recipe
 * sites keeps the original language and does NOT set this.
 */
export const HEBREW_LOCALIZATION_INSTRUCTIONS = `

**דרישת שפה ויחידות (חובה):**
- אם המתכון באנגלית או בכל שפה שאינה עברית — תרגמי אותו לעברית שוטפת: שם המתכון, המרכיבים, השלבים, התיאור. השאירי במקור רק שמות מותגים או שמות פרטיים.
- המירי יחידות מדידה למידות שנהוגות בישראל. ערכי המרה סטנדרטיים:
  · 1 cup = 240 מ״ל (או 240 גרם למים; לחומרים אחרים חשבי לפי צפיפות סבירה — קמח cup ≈ 130 גרם, סוכר cup ≈ 200 גרם, חמאה cup ≈ 227 גרם)
  · 1 tablespoon (tbsp) = 15 מ״ל
  · 1 teaspoon (tsp) = 5 מ״ל
  · 1 ounce (oz) = 28 גרם  |  1 fl oz = 30 מ״ל
  · 1 pound (lb) = 454 גרם
  · 1 pint = 480 מ״ל  |  1 quart = 950 מ״ל  |  1 gallon = 3.8 ליטר
  · פרנהייט → צלזיוס: (F − 32) × 5/9, עגלי ל־5 הקרובים (למשל 350°F → 175°C)
  · אינץ׳ → ס״מ: אינץ׳ × 2.54, עגלי ל־0.5 ס״מ הקרובים
- כתבי את הכמות המומרת ישירות במרכיב, בלי לציין את הערך המקורי בסוגריים. למשל "2 כוסות קמח" יהפוך ל־"260 גרם קמח", לא "260 גרם קמח (2 כוסות)".
- אם היחידה במקור כבר מטרית (גרם / מ״ל / ליטר / צלזיוס) — השאירי כמו שהיא.

**כיסוי מלא של תוכן הכיתוב (חובה, קריטי):**
- במתכונים מ־TikTok/Instagram/YouTube הכותב לרוב מפרט את המתכון בכמה חלקים ("For the sauce:", "For the topping:", "לרוטב:", "לזיגוג:"). חובה לכלול את כל החלקים ואת כל המרכיבים והשלבים של כל חלק, ולא רק את החלק הראשי.
- אם יש תת־כותרות של קטעים (למשל "**Sauce**"), הפכי אותן לשלב ראשון של אותו חלק בעברית (למשל "לרוטב:") כדי לשמר את המבנה.
- אל תדלגי על שלבים בסוף הכיתוב גם אם הם מופיעים אחרי הערות/hashtags/תיוגים — המשיכי לסרוק עד סוף הטקסט.`

export async function extractRecipeFromText(
  id: ProviderId,
  key: string,
  text: string,
  sourceUrl: string,
  options?: { translateToHebrew?: boolean },
): Promise<ExtractedRecipe> {
  const localization = options?.translateToHebrew ? HEBREW_LOCALIZATION_INSTRUCTIONS : ''
  const userMsg = `URL של הדף: ${sourceUrl}\n\nתוכן הדף (טקסט בלבד):\n\n${text}\n\nחלץ מתוך זה את המתכון והחזר JSON תקף בלבד.${localization}`
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

/* ─────────────────────────────────────────────────────
   EXTRACT FROM YOUTUBE VIDEO URL — Gemini video understanding fallback
   Only Gemini supports YouTube URLs directly via fileData. Called when the
   YouTube caption track is missing so we can still recover a recipe without
   asking the user to upload the audio file.
   ───────────────────────────────────────────────────── */

const YOUTUBE_VIDEO_SYSTEM_PROMPT = `אתה מומחה בזיהוי מתכונים מסרטוני YouTube בעברית.
המשתמש שולח קישור לסרטון וידאו. תפקידך לצפות בו ולהחזיר את המתכון במבנה JSON.

חוקים:
1. חלץ את שם המתכון, המרכיבים והשלבים. שמור על עברית אם הסרטון בעברית.
2. אם היוצר הזכיר מותג/מוצר או שף — אל תמציא כמויות; ציין רק מה שנאמר.
3. **שמור זמנים בתוך השלבים** — כל אזכור של דקות/שעות בסרטון חייב להישאר בשלב הרלוונטי כדי שהמערכת תבנה כפתור טיימר.
4. **פרק לשלבים אמיתיים** — לא פסקה אחת ארוכה, אלא שלבים ממוספרים של 1–2 פעולות.
5. בחר קטגוריה אחת בלבד מתוך: ${CATEGORY_LIST}. אם לא ברור — בחר "אחר".
6. אם לא הצלחת לזהות מתכון (הסרטון על נושא אחר, או שאין די מידע) — החזר recognition_failed=true עם reason קצר.

החזר JSON תקף בלבד:
{
  "title": "שם המתכון",
  "description": "תיאור קצר או null",
  "category": "${CATEGORY_LIST}",
  "servings": מספר או null,
  "prep_minutes": מספר או null,
  "cook_minutes": מספר או null,
  "author": "שם היוצר/השף או null",
  "ingredientGroups": [
    {"title": "כותרת החלק (למשל 'לרוטב') — null אם אין חלקים", "items": ["מרכיב עם כמות ויחידה", ...]},
    ...
  ],
  "steps": [
    {"title": "שם הסעיף אם רלוונטי — null אם לא", "body": "תיאור השלב"},
    ...
  ],
  "recognition_failed": false,
  "reason": null
}`

/**
 * Ask Gemini to watch a YouTube video URL and extract the recipe.
 * Gemini accepts public YouTube URIs via `fileData` — no download needed.
 * Throws on network / API errors; caller decides whether to fall back further.
 */
export async function extractRecipeFromYoutubeUrlWithGemini(
  key: string,
  youtubeUrl: string,
  options?: { translateToHebrew?: boolean },
): Promise<ExtractedRecipe> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(key)}`
  const userText = options?.translateToHebrew
    ? `צפי בסרטון וחלצי את המתכון. החזירי JSON תקף בלבד.${HEBREW_LOCALIZATION_INSTRUCTIONS}`
    : 'צפי בסרטון וחלצי את המתכון. החזירי JSON תקף בלבד.'
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: YOUTUBE_VIDEO_SYSTEM_PROMPT }] },
      contents: [
        {
          role: 'user',
          parts: [
            { fileData: { fileUri: youtubeUrl, mimeType: 'video/mp4' } },
            { text: userText },
          ],
        },
      ],
      generationConfig: { responseMimeType: 'application/json', temperature: 0 },
    }),
    signal: AbortSignal.timeout(50_000),
  })
  if (!r.ok) throw new Error(`Google video ${r.status}: ${extractApiMessage(await r.text().catch(() => ''))}`)
  const data = await r.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error('Empty video-understanding response from Google')
  return { ...parseJsonFromModelText(content), provider: 'google:gemini-3.6-flash (video)' }
}

function parseJsonFromModelText(text: string): Omit<ExtractedRecipe, 'provider'> {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
  const parsed = JSON.parse(cleaned)
  const rawTitle = typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : null

  // Parse ingredientGroups (new format) — fall back to flat ingredients (old format)
  let ingredientGroups: IngredientGroup[]
  if (Array.isArray(parsed.ingredientGroups) && parsed.ingredientGroups.length > 0) {
    ingredientGroups = parsed.ingredientGroups.map((g: unknown) => {
      const group = g as Record<string, unknown>
      const title = typeof group.title === 'string' && group.title.trim() ? group.title.trim() : null
      const items = Array.isArray(group.items) ? group.items.map(String).filter(Boolean) : []
      return { title, items }
    }).filter((g: IngredientGroup) => g.items.length > 0)
  } else if (Array.isArray(parsed.ingredients) && parsed.ingredients.length > 0) {
    ingredientGroups = [{ title: null, items: parsed.ingredients.map(String).filter(Boolean) }]
  } else {
    ingredientGroups = []
  }

  // Derive flat list for backward compat
  const ingredients = ingredientGroups.flatMap((g) => g.items)

  // Parse steps — new format is [{title, body}], old format is [string]
  const steps: Array<{ title: string | null; body: string }> = Array.isArray(parsed.steps)
    ? parsed.steps.map((s: unknown) => {
        if (typeof s === 'string') return { title: null, body: s }
        const obj = s as Record<string, unknown>
        const title = typeof obj.title === 'string' && obj.title.trim() ? obj.title.trim() : null
        const body = typeof obj.body === 'string' ? obj.body : String(s)
        return { title, body }
      }).filter((s: { body: string }) => s.body.trim())
    : []

  return {
    title: rawTitle ?? 'מתכון ללא שם',
    description: parsed.description ?? null,
    category: typeof parsed.category === 'string' ? parsed.category : null,
    servings: typeof parsed.servings === 'number' ? parsed.servings : null,
    prep_minutes: typeof parsed.prep_minutes === 'number' ? parsed.prep_minutes : null,
    cook_minutes: typeof parsed.cook_minutes === 'number' ? parsed.cook_minutes : null,
    author: typeof parsed.author === 'string' && parsed.author.trim() ? parsed.author.trim() : null,
    ingredients,
    ingredientGroups,
    steps,
    raw_text: typeof parsed.raw_text === 'string' ? parsed.raw_text : null,
    recognition_failed: parsed.recognition_failed === true || rawTitle === null,
    reason: typeof parsed.reason === 'string' ? parsed.reason : null,
  }
}
