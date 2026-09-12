import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getKeyCandidates } from '@/lib/ai-providers'
import { extractRecipeFromText } from '@/lib/provider-adapters'
import { pickSourceForUrl } from '@/lib/video-import/sources'
import { transcribeWithWhisper } from '@/lib/video-import/whisper'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25MB — OpenAI Whisper hard cap
const ALLOWED_MIME_PREFIXES = ['audio/', 'video/']

type SourceMetaOut = {
  sourceKind: string
  sourceUrl: string | null
  title: string | null
  author: string | null
  thumbnailUrl: string | null
}

/**
 * Video/audio recipe import.
 *
 * Accepts multipart/form-data with EITHER:
 *   - `url`  → a supported video URL (currently YouTube). Uses caption tracks.
 *   - `file` → an audio or video file (≤25MB). Sent to OpenAI Whisper.
 *
 * On success, returns the same `ExtractedRecipe` shape as /api/import-text so
 * the review UI can be shared. The source's title / thumbnail are included so
 * the client can pre-fill and offer to attach the thumbnail as the primary image.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'גוף לא תקין (multipart/form-data)' }, { status: 400 })
  }

  const urlValue = form.get('url')
  const fileValue = form.get('file')
  const hasUrl = typeof urlValue === 'string' && urlValue.trim().length > 0
  const hasFile = fileValue instanceof File && fileValue.size > 0

  if (!hasUrl && !hasFile) {
    return NextResponse.json({ error: 'צריך כתובת סרטון או קובץ אודיו/וידאו' }, { status: 400 })
  }

  const candidates = await getKeyCandidates()
  if (candidates.length === 0) {
    return NextResponse.json(
      { error: 'לא הוגדר ספק AI. עברי להגדרות ה-API להוסיף מפתח.' },
      { status: 503 },
    )
  }

  let transcript = ''
  let metadata: SourceMetaOut = {
    sourceKind: 'other',
    sourceUrl: null,
    title: null,
    author: null,
    thumbnailUrl: null,
  }
  let requiredAudioTranscription = false

  try {
    if (hasUrl) {
      const url = (urlValue as string).trim()
      const source = pickSourceForUrl(url)
      if (!source) {
        return NextResponse.json(
          { error: 'הכתובת אינה נתמכת. כרגע תומכים ב-YouTube; בקרוב יתווספו נוספים.' },
          { status: 400 },
        )
      }
      const meta = await source.getMetadata(url)
      metadata = meta
      const t = await source.tryFetchTranscript(url)
      if (!t || !t.text) {
        return NextResponse.json(
          {
            error:
              'לא נמצאו כתוביות לסרטון. הורידי אותו לקובץ MP3/MP4 והעלי כאן, ואני אתמלל בעזרת Whisper.',
            code: 'NO_CAPTIONS',
          },
          { status: 422 },
        )
      }
      transcript = t.text
      requiredAudioTranscription = false
    } else if (hasFile) {
      const file = fileValue as File
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: `הקובץ גדול מדי (מקסימום ${MAX_FILE_BYTES / 1024 / 1024} מגה).` },
          { status: 413 },
        )
      }
      const mime = file.type || ''
      if (!ALLOWED_MIME_PREFIXES.some((p) => mime.startsWith(p))) {
        return NextResponse.json(
          { error: 'סוג הקובץ אינו נתמך. יש להעלות קובץ אודיו או וידאו.' },
          { status: 415 },
        )
      }
      // Whisper needs an OpenAI key. Find the first OpenAI candidate.
      const openai = candidates.find((c) => c.id === 'openai')
      if (!openai) {
        return NextResponse.json(
          { error: 'לתמלול אודיו נדרש מפתח OpenAI. הגדירי אותו בהגדרות ה-API.' },
          { status: 503 },
        )
      }
      const result = await transcribeWithWhisper(openai.key, file, {
        language: 'he',
        filename: file.name || 'upload',
        prompt: 'מתכון בישול בעברית. מרכיבים במשקלים, זמנים בדקות, שלבי הכנה.',
      })
      transcript = result.text
      requiredAudioTranscription = true
      metadata = {
        sourceKind: 'file',
        sourceUrl: null,
        title: file.name.replace(/\.[^.]+$/, '') || null,
        author: null,
        thumbnailUrl: null,
      }
    }
  } catch (err) {
    const code = (err as { code?: string }).code
    const msg = err instanceof Error ? err.message : String(err)
    const status = code === 'NO_CAPTIONS' ? 422 : 500
    return NextResponse.json({ error: msg, code }, { status })
  }

  if (!transcript.trim()) {
    return NextResponse.json({ error: 'לא הצלחתי לחלץ טקסט מקור.' }, { status: 500 })
  }

  // Structuring: enrich the transcript with the video's title / author so the
  // model can lean on them if the speech is unclear.
  const preface = [
    metadata.title ? `כותרת הסרטון: ${metadata.title}` : '',
    metadata.author ? `שף/יוצר: ${metadata.author}` : '',
    metadata.sourceUrl ? `מקור: ${metadata.sourceUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const enrichedText = preface ? `${preface}\n\nתמלול:\n${transcript}` : transcript
  const sourceUrl = metadata.sourceUrl ?? ''

  const errors: string[] = []
  for (const { id, key } of candidates) {
    try {
      const recipe = await extractRecipeFromText(id, key, enrichedText.trim(), sourceUrl)
      return NextResponse.json({
        ...recipe,
        sourceMetadata: {
          ...metadata,
          requiredAudioTranscription,
          transcriptChars: transcript.length,
        },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[import-video] ${id} failed:`, msg)
      errors.push(`${id}: ${msg}`)
    }
  }

  return NextResponse.json(
    { error: 'החילוץ נכשל בכל הספקים', detail: errors },
    { status: 502 },
  )
}
