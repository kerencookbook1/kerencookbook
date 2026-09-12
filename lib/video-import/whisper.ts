/**
 * Whisper transcription via OpenAI's audio/transcriptions endpoint.
 *
 * Whisper caps file size at 25MB; the API route enforces this before calling.
 * Hebrew (`he`) is well-supported. Passing the language hint dramatically
 * cuts hallucinations on short clips.
 */

const WHISPER_ENDPOINT = 'https://api.openai.com/v1/audio/transcriptions'
const WHISPER_MODEL = 'whisper-1'

export type WhisperResult = {
  text: string
  language: string | null
  durationSeconds: number | null
}

export async function transcribeWithWhisper(
  openaiKey: string,
  file: File | Blob,
  opts: { language?: string; filename?: string; prompt?: string } = {},
): Promise<WhisperResult> {
  const form = new FormData()
  const filename = opts.filename ?? (file instanceof File ? file.name : 'audio.webm')
  form.append('file', file, filename)
  form.append('model', WHISPER_MODEL)
  form.append('response_format', 'verbose_json')
  if (opts.language) form.append('language', opts.language)
  if (opts.prompt) form.append('prompt', opts.prompt)

  const res = await fetch(WHISPER_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${openaiKey}` },
    body: form,
    // Whisper can take a while on a large clip; give it up to 90s.
    signal: AbortSignal.timeout(90_000),
  })

  if (!res.ok) {
    const detail = await safeText(res)
    throw new Error(`Whisper transcription failed: ${res.status} ${detail.slice(0, 300)}`)
  }

  const data = (await res.json()) as {
    text?: string
    language?: string
    duration?: number
  }
  return {
    text: (data.text ?? '').trim(),
    language: data.language ?? null,
    durationSeconds: typeof data.duration === 'number' ? data.duration : null,
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text()
  } catch {
    return ''
  }
}
