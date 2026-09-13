/**
 * Pull all timer expressions out of the free text of a cooking step so we
 * can turn them into clickable countdown buttons in the recipe view.
 *
 * The parser handles both Hebrew and English, digit + word forms, ranges
 * ("5-7 דקות"), fractions ("½ שעה", "1½ שעות"), and unit abbreviations
 * ("דק'", "דק׳", "min", "hr"). Ranges resolve to the midpoint so the timer
 * matches the average expected wait. Fractions are common in Hebrew recipes
 * (½ / רבע / שליש / חצי שעה).
 *
 * Multiple timers per step are supported — a step like
 *   "לטגן 3 דקות, להפוך ולטגן עוד 2 דקות"
 * yields two independent timer buttons.
 */

export type StepTimer = {
  /** Total duration in seconds. */
  seconds: number
  /** Human-readable label ("3 דקות", "1½ שעות"). */
  label: string
  /** Where in the source text the expression begins/ends (for future highlighting). */
  matchStart: number
  matchEnd: number
}

const HEB_MIN = /(?:דקות|דקה|דק['׳]|דק\b)/
const HEB_HOUR = /(?:שעות|שעה|שע['׳]|שע\b)/
const HEB_SEC = /(?:שניות|שנייה|שניה|שנ['׳]|שנ\b)/
const EN_MIN = /(?:minutes?|mins?)/i
const EN_HOUR = /(?:hours?|hrs?)/i
const EN_SEC = /(?:seconds?|secs?)/i

/** One number OR a range ("5", "5-7", "5–7"). Named group `n` captures it. */
const NUMBER = /(?<n>\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?)/
/** Prefix fractions written as single glyphs: ½ ⅓ ¼ ¾ ⅔ etc. */
const FRACTION_GLYPHS: Record<string, number> = {
  '½': 0.5, '⅓': 1 / 3, '⅔': 2 / 3,
  '¼': 0.25, '¾': 0.75,
  '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8,
  '⅙': 1 / 6, '⅚': 5 / 6, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
}
/** Hebrew fraction words that appear before the unit (חצי שעה, רבע שעה). */
const HEBREW_FRACTION_WORDS: Record<string, number> = {
  'חצי': 0.5,
  'רבע': 0.25,
  'שליש': 1 / 3,
  'שני שלישי': 2 / 3,
  'שלושת רבעי': 0.75,
}

function toMultiplier(unitMatch: string): number {
  if (HEB_HOUR.test(unitMatch) || EN_HOUR.test(unitMatch)) return 3600
  if (HEB_SEC.test(unitMatch) || EN_SEC.test(unitMatch)) return 1
  return 60 // default: minutes
}

function parseNumberOrRange(raw: string): number | null {
  const cleaned = raw.replace(/\s+/g, '').replace(/,/g, '.')
  const rangeSep = /[-–]/
  if (rangeSep.test(cleaned)) {
    const [a, b] = cleaned.split(rangeSep).map((s) => parseFloat(s))
    if (Number.isFinite(a) && Number.isFinite(b)) {
      // Prefer the midpoint so "5-7 דקות" ≈ 6 min timer.
      return Math.round((a + b) / 2 * 100) / 100
    }
    if (Number.isFinite(a)) return a
    return null
  }
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : null
}

/**
 * Format a duration in seconds as a compact Hebrew label.
 * < 60s → "45 שנ'"
 * ≥ 60s → "6 דק'"
 * ≥ 3600s → "1:30 שעות" (H:MM if minutes remain)
 */
export function formatDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds)
  if (s < 60) return `${s} שנ'`
  if (s < 3600) {
    const m = Math.round(s / 60)
    return `${m} דק'`
  }
  const h = Math.floor(s / 3600)
  const m = Math.round((s % 3600) / 60)
  return m === 0 ? `${h} שעות` : `${h}:${m.toString().padStart(2, '0')} שעות`
}

/**
 * Scan the step body text and return every timer we find, left-to-right.
 * De-duplicates overlapping matches (regex alternatives compete).
 */
export function parseStepTimers(body: string): StepTimer[] {
  if (!body || !body.trim()) return []
  try {
    return parseStepTimersInner(body)
  } catch (err) {
    // Never crash the recipe page over a parser edge case — better to show
    // no timer buttons than an error boundary.
    console.error('[step-timers] parse failed:', err)
    return []
  }
}

function parseStepTimersInner(body: string): StepTimer[] {

  // Master regex: optional fraction (glyph OR Hebrew word) OR number, then a unit.
  // We build it dynamically to keep the Hebrew and English variants readable.
  const unit = [HEB_HOUR.source, HEB_MIN.source, HEB_SEC.source, EN_HOUR.source, EN_MIN.source, EN_SEC.source].join('|')
  // Unicode fraction glyphs — inside a character class they don't need
  // escaping (and escaping them under the /u flag actually throws
  // "Invalid escape"). Just interpolate them raw.
  const glyphFrac = Object.keys(FRACTION_GLYPHS).join('')
  const hebFracWord = Object.keys(HEBREW_FRACTION_WORDS)
    .sort((a, b) => b.length - a.length)  // longest first
    .join('|')

  //   1½ דקות / 5-7 דקות / חצי שעה / ½ דקה / 5 minutes / 45 שניות
  const master = new RegExp(
    `(?:` +
      // (a) Hebrew word fraction followed by unit  ("חצי שעה")
      `(?<hebfrac>${hebFracWord})\\s+(?<hebfracUnit>${unit})` +
      `|` +
      // (b) Digit(s) with optional glyph fraction, followed by unit
      `(?<hasDigits>` +
        `(?<digits>\\d+(?:[.,]\\d+)?(?:\\s*[-–]\\s*\\d+(?:[.,]\\d+)?)?)` +
        `(?:\\s*(?<glyph>[${glyphFrac}]))?` +
        `\\s*(?<digitsUnit>${unit})` +
      `)` +
      `|` +
      // (c) Bare glyph fraction with unit ("½ דקה")
      `(?<glyphOnly>[${glyphFrac}])\\s*(?<glyphOnlyUnit>${unit})` +
    `)`,
    'giu',
  )

  const results: StepTimer[] = []
  const seenRanges = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = master.exec(body))) {
    const g = m.groups ?? {}
    let value = 0
    let unitText = ''

    if (g.hebfrac && g.hebfracUnit) {
      const frac = HEBREW_FRACTION_WORDS[g.hebfrac.trim()] ?? 0
      value = frac
      unitText = g.hebfracUnit
    } else if (g.hasDigits && g.digits && g.digitsUnit) {
      const base = parseNumberOrRange(g.digits) ?? 0
      const glyph = g.glyph ? FRACTION_GLYPHS[g.glyph] ?? 0 : 0
      value = base + glyph
      unitText = g.digitsUnit
    } else if (g.glyphOnly && g.glyphOnlyUnit) {
      value = FRACTION_GLYPHS[g.glyphOnly] ?? 0
      unitText = g.glyphOnlyUnit
    }

    if (value <= 0 || !unitText) continue
    const mult = toMultiplier(unitText)
    const seconds = Math.round(value * mult)
    if (seconds <= 0 || seconds > 24 * 3600) continue // sanity

    const key = `${m.index}:${m.index + m[0].length}`
    if (seenRanges.has(key)) continue
    seenRanges.add(key)

    results.push({
      seconds,
      label: formatDuration(seconds),
      matchStart: m.index,
      matchEnd: m.index + m[0].length,
    })
  }
  return results
}
