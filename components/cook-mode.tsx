"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseStepTimers } from "@/lib/step-timers";
import { StepTimerButton } from "@/components/recipes/step-timer-button";

type WakeLockSentinel = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (event: 'release', listener: () => void) => void;
};
type NavigatorWithWakeLock = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
};

type Ingredient = { id: string; name: string; amount: string | null; unit: string | null }
type Step = { id: string; title: string | null; body: string; duration_seconds: number | null }

type Props = {
  recipeId: string
  recipeTitle: string
  ingredients: Ingredient[]
  steps: Step[]
  defaultServings: number
}

/**
 * Cook mode — all steps on ONE scrollable page. Each step gets a big number
 * badge and a readable body. When the step mentions a cooking duration, a
 * standalone "טיימר N דק'" button appears BETWEEN this step and the next,
 * matching the layout the user showed from myrecipebook.co.il.
 *
 * Timers use the shared StepTimerButton (countdown, beep, vibrate). Timer
 * chips extracted from the DB's duration_seconds and from inline text like
 * "עד 5 דקות" are de-duplicated so each real timer appears once.
 *
 * Also preserves: TTS ("read aloud"), the wake-lock, per-serving scaling,
 * step check-off, and the collapsible ingredients drawer.
 */
export function CookMode({ recipeId, recipeTitle, ingredients, steps, defaultServings }: Props) {
  const [servings, setServings] = useState(defaultServings || 4)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [ingredientsOpen, setIngredientsOpen] = useState(false)
  // User's preference for keeping the screen on. Defaults to true on first
  // visit (cooking usually benefits from a lit screen), then persists in
  // localStorage so once she turns it off she's not fighting it every time.
  const [wakeLockPref, setWakeLockPref] = useState<boolean>(true)
  const [wakeLockOn, setWakeLockOn] = useState(false)
  const [wakeLockUnsupported, setWakeLockUnsupported] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('cook.keepScreenOn')
    if (stored === '0') setWakeLockPref(false)
    else if (stored === '1') setWakeLockPref(true)
    if (!('wakeLock' in navigator)) setWakeLockUnsupported(true)
  }, [])

  function toggleWakeLockPref() {
    setWakeLockPref((prev) => {
      const next = !prev
      try { window.localStorage.setItem('cook.keepScreenOn', next ? '1' : '0') } catch {}
      return next
    })
  }
  const [ttsSupported, setTtsSupported] = useState<boolean | null>(null)
  const [readingIdx, setReadingIdx] = useState<number | null>(null)
  const [ttsPaused, setTtsPaused] = useState(false)
  const readingIdxRef = useRef<number | null>(null)

  useEffect(() => {
    setTtsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Wake lock — keep the screen on while cooking. Acquires/releases based on
  // the user's stored preference so she can flip it any time via the header
  // toggle. Re-acquires automatically when the tab becomes visible again
  // (the browser drops wake locks whenever the tab backgrounds).
  useEffect(() => {
    let cancelled = false
    const nav = navigator as NavigatorWithWakeLock

    async function acquire() {
      if (!nav.wakeLock) return
      if (wakeLockRef.current) return
      try {
        const sentinel = await nav.wakeLock.request('screen')
        if (cancelled) {
          sentinel.release().catch(() => {})
          return
        }
        wakeLockRef.current = sentinel
        setWakeLockOn(true)
        sentinel.addEventListener('release', () => {
          if (wakeLockRef.current === sentinel) {
            wakeLockRef.current = null
            setWakeLockOn(false)
          }
        })
      } catch { /* user gesture required or blocked */ }
    }
    async function release() {
      if (!wakeLockRef.current) {
        setWakeLockOn(false)
        return
      }
      try { await wakeLockRef.current.release() } catch {}
      wakeLockRef.current = null
      setWakeLockOn(false)
    }

    if (wakeLockPref) acquire()
    else release()

    const onVisibility = () => {
      if (wakeLockPref && document.visibilityState === 'visible' && !wakeLockRef.current) {
        acquire()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      release()
    }
  }, [wakeLockPref])

  const doneCount = steps.filter((s) => checked[s.id]).length
  const ratio = servings / (defaultServings || 4)
  const progressPct = steps.length ? (doneCount / steps.length) * 100 : 0

  // Pre-compute timers for every step so we can render them between steps.
  const stepTimers = useMemo(
    () => steps.map((s) => {
      const list: Array<{ seconds: number; label?: string }> = []
      if (s.duration_seconds && s.duration_seconds > 0) {
        list.push({ seconds: s.duration_seconds })
      }
      for (const t of parseStepTimers(s.body)) {
        if (!list.some((existing) => Math.abs(existing.seconds - t.seconds) < 5)) {
          list.push({ seconds: t.seconds, label: t.label })
        }
      }
      return list
    }),
    [steps],
  )

  function toggleCheck(stepId: string) {
    setChecked((prev) => ({ ...prev, [stepId]: !prev[stepId] }))
  }

  function pickHebrewVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices()
    return (
      voices.find((v) => v.lang.toLowerCase().startsWith('he')) ??
      voices.find((v) => v.lang.toLowerCase().startsWith('iw')) ??
      null
    )
  }

  const speakFrom = useCallback((idx: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const s = steps[idx]
    if (!s) return
    window.speechSynthesis.cancel()
    const text = [s.title, s.body].filter(Boolean).join('. ')
    const u = new SpeechSynthesisUtterance(text)
    const voice = pickHebrewVoice()
    if (voice) u.voice = voice
    u.rate = 0.95
    u.pitch = 1
    u.lang = 'he-IL'
    u.onend = () => {
      if (readingIdxRef.current === idx) {
        setReadingIdx(null)
        setTtsPaused(false)
      }
    }
    setReadingIdx(idx)
    readingIdxRef.current = idx
    setTtsPaused(false)
    window.speechSynthesis.speak(u)
  }, [steps])

  function pauseSpeech() {
    window.speechSynthesis.pause()
    setTtsPaused(true)
  }
  function resumeSpeech() {
    window.speechSynthesis.resume()
    setTtsPaused(false)
  }
  function stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    readingIdxRef.current = null
    setReadingIdx(null)
    setTtsPaused(false)
  }

  if (steps.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center" dir="rtl">
        <p className="text-neutral-600">אין שלבים במתכון הזה עדיין.</p>
        <Link href={`/recipes/${recipeId}`} className="mt-4 inline-block text-lime-700 underline">
          חזרה למתכון
        </Link>
      </main>
    )
  }

  return (
    <main
      className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6"
      dir="rtl"
      style={{ background: 'var(--canvas, #fafaf9)', minHeight: '100dvh' }}
    >
      {/* ── Sticky header with progress ── */}
      <header className="sticky top-0 z-10 -mx-4 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/recipes/${recipeId}`}
            className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-300"
            aria-label="חזרה למתכון"
          >
            ← יציאה
          </Link>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-neutral-900">{recipeTitle}</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {steps.length} שלבים · {doneCount} סומנו
            </p>
          </div>
          {!wakeLockUnsupported && (
            <button
              type="button"
              onClick={toggleWakeLockPref}
              aria-pressed={wakeLockPref}
              title={
                wakeLockPref
                  ? wakeLockOn
                    ? 'המסך יישאר דלוק — לחצי לכיבוי'
                    : 'המסך יישאר דלוק (מבקש הרשאה)'
                  : 'המסך ייכבה כרגיל — לחצי להשארה דלוק'
              }
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm transition"
              style={{
                background: wakeLockPref ? (wakeLockOn ? '#EAF1E3' : '#FEF3D4') : '#f5f5f4',
                color: wakeLockPref ? (wakeLockOn ? '#3f6212' : '#8a5c00') : '#525252',
                border: `1.5px solid ${wakeLockPref ? (wakeLockOn ? '#4d7c0f' : '#d4a01a') : '#d4d4d4'}`,
              }}
            >
              <span aria-hidden style={{ fontSize: '.95rem' }}>
                {wakeLockPref ? (wakeLockOn ? '💡' : '⏳') : '🌙'}
              </span>
              <span>
                {wakeLockPref ? (wakeLockOn ? 'מסך דלוק' : 'מבקש...') : 'מסך רגיל'}
              </span>
            </button>
          )}
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full bg-lime-600 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* ── Recipe title ── */}
      <h1
        className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl"
        style={{ fontFamily: 'Georgia, serif', color: '#2A2620' }}
      >
        {recipeTitle}
      </h1>
      <p className="mt-2 text-sm font-semibold text-neutral-500">
        {steps.length} שלבים
      </p>

      {/* ── Collapsible ingredients drawer ── */}
      <section className="mt-4">
        <button
          type="button"
          onClick={() => setIngredientsOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 shadow-sm hover:border-lime-400"
          aria-expanded={ingredientsOpen}
        >
          <span className="flex items-center gap-2">
            <span aria-hidden>🧂</span>
            <span>מרכיבים ({ingredients.length})</span>
            <span className="text-xs font-normal text-neutral-500">· {servings} מנות</span>
          </span>
          <span aria-hidden className={`transition-transform ${ingredientsOpen ? 'rotate-180' : ''}`}>▾</span>
        </button>
        {ingredientsOpen && (
          <div className="mt-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-end gap-2 border-b border-neutral-100 pb-3">
              <span className="text-xs text-neutral-500">התאם מנות:</span>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 text-lg font-bold text-neutral-700 hover:bg-neutral-100"
                aria-label="הקטנת מנות"
                onClick={() => setServings((v) => Math.max(1, v - 1))}
              >
                −
              </button>
              <span className="min-w-8 text-center text-xl font-bold">{servings}</span>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 text-lg font-bold text-neutral-700 hover:bg-neutral-100"
                aria-label="הגדלת מנות"
                onClick={() => setServings((v) => v + 1)}
              >
                +
              </button>
            </div>
            <ul className="grid gap-1 text-sm sm:grid-cols-2">
              {ingredients.map((ing) => {
                const numeric = ing.amount != null ? parseFloat(ing.amount) : NaN
                const scaledAmount = !Number.isNaN(numeric)
                  ? (Math.round(numeric * ratio * 4) / 4).toString()
                  : ing.amount
                return (
                  <li key={ing.id} className="flex items-baseline gap-1.5 py-1">
                    {scaledAmount && (
                      <strong className="font-bold text-lime-700">{scaledAmount}</strong>
                    )}
                    {ing.unit && <span className="text-neutral-500">{ing.unit}</span>}
                    <span>{ing.name}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>

      {/* ── "איך מכינים" header ── */}
      <div className="mt-10 mb-4 flex items-baseline justify-between">
        <h2 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: 'Georgia, serif' }}>
          איך מכינים
        </h2>
        {ttsSupported && (
          <button
            type="button"
            onClick={() => (readingIdx === null ? speakFrom(0) : ttsPaused ? resumeSpeech() : stopSpeech())}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-sky-500 hover:text-sky-700"
          >
            {readingIdx === null ? '🔊 הקרא' : ttsPaused ? '▶ המשך' : '■ עצור'}
          </button>
        )}
      </div>

      {/* ── All steps rendered in sequence, with timers between them ── */}
      <ol className="grid gap-8 list-none pr-0" style={{ padding: 0, margin: 0 }}>
        {steps.map((step, idx) => {
          const isChecked = !!checked[step.id]
          const timers = stepTimers[idx] ?? []
          const isLast = idx === steps.length - 1
          return (
            <li key={step.id}>
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggleCheck(step.id)}
                  aria-pressed={isChecked}
                  aria-label={isChecked ? `בטל סימון שלב ${idx + 1}` : `סמן שלב ${idx + 1} כהושלם`}
                  className="grid shrink-0 place-items-center rounded-full font-black transition"
                  style={{
                    width: 48,
                    height: 48,
                    fontSize: '1.35rem',
                    background: isChecked ? '#4d7c0f' : 'transparent',
                    color: isChecked ? '#fff' : '#4d7c0f',
                    border: isChecked ? '2px solid #4d7c0f' : '2px solid #4d7c0f',
                    boxShadow: isChecked ? '0 2px 6px rgba(77,124,15,.3)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {isChecked ? '✓' : idx + 1}
                </button>
                <div className="flex-1 min-w-0 pt-1">
                  {step.title && (
                    <p className="mb-2 text-base font-bold text-lime-800">{step.title}</p>
                  )}
                  <p
                    className={`whitespace-pre-wrap text-lg leading-relaxed sm:text-xl ${isChecked ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {step.body}
                  </p>
                </div>
              </div>

              {/* Timers appear BETWEEN this step and the next, on their own row */}
              {timers.length > 0 && (
                <div
                  className="mt-5 flex flex-wrap items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: '#EAF1E3',
                    border: '1px solid rgba(77,124,15,.25)',
                    marginInlineStart: 64,
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: '#3f6212' }}
                  >
                    ⏱ טיימר{timers.length > 1 ? 'ים' : ''}:
                  </span>
                  {timers.map((t, ti) => (
                    <StepTimerButton key={ti} seconds={t.seconds} restLabel={t.label} />
                  ))}
                </div>
              )}

              {/* Divider between steps (except after last) */}
              {!isLast && (
                <div
                  aria-hidden
                  style={{
                    height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(77,124,15,.15), transparent)',
                    marginTop: 32,
                  }}
                />
              )}
            </li>
          )
        })}
      </ol>

      {/* ── Bottom actions ── */}
      <div className="mt-14 flex flex-wrap gap-3">
        <Link
          href={`/recipes/${recipeId}`}
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-700 shadow-sm hover:border-lime-500 hover:text-lime-700"
        >
          חזרה למתכון
        </Link>
        <button
          type="button"
          onClick={() => setChecked({})}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm hover:border-neutral-300"
        >
          נקה סימונים
        </button>
      </div>
    </main>
  );
}
