/**
 * Hebrew TTS helpers used by cook-mode.
 *
 * Two problems the browser's default handling gets wrong:
 *   1. It picks whichever voice happens to be first in `speechSynthesis.getVoices()`
 *      — on Windows that's usually "Microsoft Asaf" (robotic). We score voices
 *      to prefer Google/Apple/Neural options when available.
 *   2. Cooking text has °C, fractions like "1/2 כוס", and abbreviations
 *      ("ק״ג", "מ״ל", "דק׳") that most engines mispronounce. We expand them
 *      before handing off to the synthesizer.
 */

const HEBREW_LANG_PREFIXES = ['he', 'iw']

/** Score a voice higher when we expect it to sound natural in Hebrew. */
function scoreHebrewVoice(v: SpeechSynthesisVoice): number {
  const lang = (v.lang || '').toLowerCase()
  const name = (v.name || '').toLowerCase()
  const isHebrew = HEBREW_LANG_PREFIXES.some((p) => lang.startsWith(p))
  if (!isHebrew) return -1

  let score = 100

  // Highest quality engines
  if (name.includes('google')) score += 60          // Chrome Android + desktop Google voices
  if (name.includes('carmit')) score += 55          // iOS / macOS Apple — very natural
  if (name.includes('natural')) score += 45
  if (name.includes('neural')) score += 45
  if (name.includes('premium')) score += 40
  if (name.includes('enhanced')) score += 40

  // Microsoft's newer Israeli neural voices (Windows 11 SAPI + Edge cloud)
  if (name.includes('avri')) score += 35
  if (name.includes('hila')) score += 30

  // Older SAPI voices sound robotic — deprioritise
  if (name.includes('microsoft') && !name.includes('neural') && !name.includes('natural')) {
    score -= 15
  }

  // Default-network flag (browser guarantees offline availability) is a small plus
  // since it means playback starts instantly.
  if (v.localService) score += 3

  return score
}

/** Pick the best Hebrew voice; caller pre-loaded via getVoices(). */
export function pickBestHebrewVoice(
  voices: SpeechSynthesisVoice[],
  preferredVoiceUri?: string | null,
): SpeechSynthesisVoice | null {
  if (!voices.length) return null

  // Explicit user pick takes precedence — even if it scores low, it's what
  // they chose after listening.
  if (preferredVoiceUri) {
    const picked = voices.find((v) => v.voiceURI === preferredVoiceUri)
    if (picked) return picked
  }

  const ranked = voices
    .map((v) => ({ v, score: scoreHebrewVoice(v) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)

  return ranked[0]?.v ?? null
}

/** List Hebrew voices for the picker UI (best first). */
export function listHebrewVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices
    .map((v) => ({ v, score: scoreHebrewVoice(v) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)
    .map(({ v }) => v)
}

/**
 * Rewrite the step text so the synthesizer pronounces Hebrew-cooking shorthand
 * correctly. Every substitution is deliberately narrow — we don't want to
 * paraphrase the instruction, just spell out things the TTS engine won't.
 */
export function improveHebrewForTts(input: string): string {
  let text = input

  // ─── Fractions ──────────────────────────────────────────
  // These appear a lot: "1/2 כוס", "3/4 כפית". Read them as Hebrew words so
  // the engine doesn't say "אחד לחלק לשניים כוס".
  const fractionMap: Array<[RegExp, string]> = [
    [/(^|\s)1\s*\/\s*2(?=\s|$)/g, '$1חצי'],
    [/(^|\s)1\s*\/\s*4(?=\s|$)/g, '$1רבע'],
    [/(^|\s)3\s*\/\s*4(?=\s|$)/g, '$1שלושה רבעים'],
    [/(^|\s)1\s*\/\s*3(?=\s|$)/g, '$1שליש'],
    [/(^|\s)2\s*\/\s*3(?=\s|$)/g, '$1שני שליש'],
    [/(^|\s)1\s*\/\s*8(?=\s|$)/g, '$1שמינית'],
    // Unicode glyphs
    [/½/g, ' חצי '],
    [/¼/g, ' רבע '],
    [/¾/g, ' שלושה רבעים '],
    [/⅓/g, ' שליש '],
    [/⅔/g, ' שני שליש '],
  ]
  for (const [re, rep] of fractionMap) text = text.replace(re, rep)

  // ─── Degrees ────────────────────────────────────────────
  text = text
    .replace(/°\s*c\b/gi, ' מעלות ')
    .replace(/°\s*f\b/gi, ' מעלות פרנהייט ')
    .replace(/°/g, ' מעלות ')

  // ─── Hebrew abbreviations (gershayim / apostrophe forms) ──
  const abbreviations: Array<[RegExp, string]> = [
    [/\bק["״]?ג['׳]?/g, 'קילוגרם'],
    [/\bמ["״]ל\b/g, 'מיליליטר'],
    [/\bסמ["״]ק\b/g, 'סנטימטר מעוקב'],
    [/\bס["״]מ\b/g, 'סנטימטר'],
    [/\bמ["״]מ\b/g, 'מילימטר'],
    [/\bגר['׳]/g, 'גרם'],
    [/\bכפ['׳]/g, 'כפית'],
    [/\bדק['׳]/g, 'דקות'],
    [/\bשע['׳]/g, 'שעות'],
    [/\bשנ['׳]/g, 'שניות'],
  ]
  for (const [re, rep] of abbreviations) text = text.replace(re, rep)

  // ─── Common Latin cooking abbreviations that leak through translations ──
  text = text
    .replace(/\btbsp\b/gi, 'כף')
    .replace(/\btsp\b/gi, 'כפית')
    .replace(/\bml\b/gi, 'מיליליטר')
    .replace(/\bkg\b/gi, 'קילוגרם')
    .replace(/\bcm\b/gi, 'סנטימטר')
    .replace(/\boz\b/gi, 'אונקיה')
    .replace(/\blb\b/gi, 'פאונד')

  // Collapse whitespace so the extra spaces from substitutions don't cause
  // awkward pauses.
  text = text.replace(/\s+/g, ' ').trim()

  return text
}
