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
 * Full-screen, one-step-at-a-time cook mode inspired by myrecipebook.co.il.
 * The user sees exactly one step at a time in a large card, with any timers
 * for that step laid out as big countdown chips. Prev/Next buttons at the
 * bottom advance through the recipe; a progress bar tracks position. An
 * ingredients drawer at the top toggles open when the cook needs to double-
 * check a quantity.
 *
 * Preserves the previous mode's TTS ("read aloud") and wake-lock features.
 */
export function CookMode({ recipeId, recipeTitle, ingredients, steps, defaultServings }: Props) {
  const [servings, setServings] = useState(defaultServings || 4)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [ingredientsOpen, setIngredientsOpen] = useState(false)
  const [wakeLockOn, setWakeLockOn] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
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

  // Wake lock — keep the screen on while cooking
  useEffect(() => {
    let cancelled = false
    const nav = navigator as NavigatorWithWakeLock
    async function acquire() {
      if (!nav.wakeLock) return
      try {
        const sentinel = await nav.wakeLock.request('screen')
        if (cancelled) {
          sentinel.release().catch(() => {})
          return
        }
        wakeLockRef.current = sentinel
        setWakeLockOn(true)
        sentinel.addEventListener('release', () => setWakeLockOn(false))
      } catch { /* user gesture required */ }
    }
    acquire()
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) acquire()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      wakeLockRef.current?.release().catch(() => {})
      wakeLockRef.current = null
    }
  }, [])

  const currentStep = steps[currentIdx] ?? null
  const doneCount = steps.filter((s) => checked[s.id]).length
  const ratio = servings / (defaultServings || 4)

  // Timers detected in the current step body (plus the DB duration_seconds)
  const currentTimers = useMemo(() => {
    if (!currentStep) return [] as Array<{ seconds: number; label?: string }>
    const list: Array<{ seconds: number; label?: string }> = []
    if (currentStep.duration_seconds && currentStep.duration_seconds > 0) {
      list.push({ seconds: currentStep.duration_seconds })
    }
    for (const t of parseStepTimers(currentStep.body)) {
      if (!list.some((existing) => Math.abs(existing.seconds - t.seconds) < 5)) {
        list.push({ seconds: t.seconds, label: t.label })
      }
    }
    return list
  }, [currentStep])

  function goPrev() {
    setCurrentIdx((i) => Math.max(0, i - 1))
    stopSpeech()
  }

  function goNext() {
    if (currentStep && !checked[currentStep.id]) {
      // Mark the current step done when advancing.
      setChecked((prev) => ({ ...prev, [currentStep.id]: true }))
    }
    setCurrentIdx((i) => Math.min(steps.length - 1, i + 1))
    stopSpeech()
  }

  function toggleCheck() {
    if (!currentStep) return
    setChecked((prev) => ({ ...prev, [currentStep.id]: !prev[currentStep.id] }))
  }

  // Keyboard: arrow left/right to navigate (RTL), space to check
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'ArrowLeft') goNext()
      else if (e.key === 'ArrowRight') goPrev()
      else if (e.key === ' ') { e.preventDefault(); toggleCheck() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, currentStep])

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

  const progressPct = ((currentIdx + 1) / steps.length) * 100
  const isLast = currentIdx === steps.length - 1
  const isFirst = currentIdx === 0

  return (
    <main
      className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col px-4 pb-24 pt-4 sm:px-6"
      dir="rtl"
      style={{ background: 'var(--canvas, #fafaf9)' }}
    >
      {/* ── Header with progress ── */}
      <header className="sticky top-0 z-10 -mx-4 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/recipes/${recipeId}`}
            className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-300"
            aria-label="חזרה למתכון"
            title="חזרה למתכון"
          >
            ← יציאה
          </Link>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-neutral-500">{recipeTitle}</p>
            <p className="mt-0.5 text-[0.7rem] font-bold text-lime-700">
              שלב {currentIdx + 1} מתוך {steps.length} · {doneCount} סומנו
            </p>
          </div>
          {wakeLockOn && (
            <span
              className="hidden sm:inline-flex items-center gap-1 rounded-md bg-lime-100 px-2 py-1 text-[0.7rem] font-semibold text-lime-700"
              title="המסך יישאר דלוק"
            >
              💡
            </span>
          )}
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full bg-lime-600 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* ── Collapsible ingredients drawer ── */}
      <section className="mt-3">
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

      {/* ── The single, big step card ── */}
      {currentStep && (
        <section
          key={currentStep.id}
          className="mt-4 flex-1 rounded-2xl border-2 border-neutral-200 bg-white p-6 shadow-md sm:p-8"
          style={{
            animation: 'stepCardIn .28s cubic-bezier(.2,.7,.2,1) both',
          }}
        >
          <style>{`
            @keyframes stepCardIn {
              from { opacity: 0; transform: translateY(6px); }
              to   { opacity: 1; transform: none; }
            }
          `}</style>

          {/* Big step number badge */}
          <div className="flex items-start justify-between gap-4">
            <div
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-2xl font-black text-white shadow-md"
              style={{ background: 'var(--terracotta-dark, #4d7c0f)' }}
              aria-hidden
            >
              {currentIdx + 1}
            </div>
            {ttsSupported && (
              <button
                type="button"
                onClick={() => (readingIdx === currentIdx ? (ttsPaused ? resumeSpeech() : pauseSpeech()) : speakFrom(currentIdx))}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm hover:border-sky-500 hover:text-sky-700"
                aria-label={readingIdx === currentIdx ? (ttsPaused ? 'המשך הקראה' : 'השהה הקראה') : 'הקרא את השלב'}
              >
                {readingIdx === currentIdx
                  ? ttsPaused ? '▶ המשך' : '⏸ השהה'
                  : '🔊 הקרא'}
              </button>
            )}
          </div>

          {currentStep.title && (
            <p className="mt-4 text-lg font-bold text-lime-700 sm:text-xl">{currentStep.title}</p>
          )}

          <p
            className="mt-3 whitespace-pre-wrap text-lg leading-relaxed text-neutral-900 sm:text-xl"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {currentStep.body}
          </p>

          {/* Prominent timer chip(s) */}
          {currentTimers.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-lime-50 p-4 border border-lime-200">
              <span className="text-sm font-bold text-lime-800">⏱ טיימרים לשלב זה:</span>
              {currentTimers.map((t, i) => (
                <StepTimerButton key={i} seconds={t.seconds} restLabel={t.label} />
              ))}
            </div>
          )}

          {/* Check done + navigation */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-5">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-neutral-700">
              <input
                type="checkbox"
                checked={!!checked[currentStep.id]}
                onChange={toggleCheck}
                className="h-5 w-5 rounded border-neutral-300 accent-lime-600"
              />
              סמן שלב זה כהושלם
            </label>
          </div>
        </section>
      )}

      {/* ── Bottom nav bar ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-3xl items-center gap-3 border-t border-neutral-200 bg-white/95 p-3 backdrop-blur sm:px-6"
        aria-label="ניווט שלבים"
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={isFirst}
          className="min-w-24 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 shadow-sm transition hover:border-neutral-300 disabled:opacity-40"
        >
          → הקודם
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={isLast}
          className="flex-1 rounded-xl bg-lime-700 px-4 py-4 text-base font-bold text-white shadow-md transition hover:bg-lime-800 active:scale-95 disabled:opacity-40"
          style={{ minHeight: 56 }}
        >
          {isLast ? '✓ סיימתי לבשל' : 'לשלב הבא ←'}
        </button>
      </nav>
    </main>
  );
}
