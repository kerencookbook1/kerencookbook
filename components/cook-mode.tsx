"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type WakeLockSentinel = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (event: 'release', listener: () => void) => void;
};
type NavigatorWithWakeLock = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
};

function playAlertBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.0);
    setTimeout(() => ctx.close(), 1200);
  } catch { /* audio might be blocked */ }
  try { navigator.vibrate?.([220, 90, 220]); } catch { /* not available */ }
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

type Ingredient = { id: string; name: string; amount: string | null; unit: string | null }
type Step = { id: string; title: string | null; body: string; duration_seconds: number | null }

type Props = {
  recipeId: string
  recipeTitle: string
  ingredients: Ingredient[]
  steps: Step[]
  defaultServings: number
}

export function CookMode({ recipeId, recipeTitle, ingredients, steps, defaultServings }: Props) {
  const [servings, setServings] = useState(defaultServings || 4)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [wakeLockOn, setWakeLockOn] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const [readingIdx, setReadingIdx] = useState<number | null>(null)
  const [ttsPaused, setTtsPaused] = useState(false)
  const [ttsSupported, setTtsSupported] = useState<boolean | null>(null)
  const readingIdxRef = useRef<number | null>(null)

  useEffect(() => {
    setTtsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  function pickHebrewVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices()
    return (
      voices.find((v) => v.lang.toLowerCase().startsWith('he')) ??
      voices.find((v) => v.lang.toLowerCase().startsWith('iw')) ??
      null
    )
  }

  function speakFrom(startIndex: number) {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    setTtsPaused(false)
    const voice = pickHebrewVoice()

    const speakOne = (idx: number) => {
      if (idx >= steps.length) {
        setReadingIdx(null)
        readingIdxRef.current = null
        return
      }
      readingIdxRef.current = idx
      setReadingIdx(idx)
      const step = steps[idx]
      const text = [step.title, step.body].filter(Boolean).join('. ')
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'he-IL'
      if (voice) u.voice = voice
      u.rate = 0.95
      u.onend = () => {
        // Move on only if we're still reading this same index
        if (readingIdxRef.current === idx) speakOne(idx + 1)
      }
      u.onerror = () => {
        setReadingIdx(null)
        readingIdxRef.current = null
      }
      window.speechSynthesis.speak(u)
    }
    speakOne(startIndex)
  }

  function pauseSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause()
      setTtsPaused(true)
    }
  }

  function resumeSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume()
      setTtsPaused(false)
    }
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setReadingIdx(null)
    readingIdxRef.current = null
    setTtsPaused(false)
  }

  // Keep screen on for the whole cook session
  useEffect(() => {
    const nav = navigator as NavigatorWithWakeLock
    if (!nav.wakeLock) return
    let cancelled = false
    ;(async () => {
      try {
        const lock = await nav.wakeLock!.request('screen')
        if (cancelled) { await lock.release(); return }
        wakeLockRef.current = lock
        setWakeLockOn(true)
        lock.addEventListener('release', () => setWakeLockOn(false))
      } catch { /* denied or unsupported */ }
    })()
    const onVisibility = async () => {
      if (document.visibilityState !== 'visible' || wakeLockRef.current) return
      try {
        const lock = await nav.wakeLock!.request('screen')
        wakeLockRef.current = lock
        setWakeLockOn(true)
        lock.addEventListener('release', () => setWakeLockOn(false))
      } catch { /* ignore */ }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      wakeLockRef.current?.release().catch(() => {})
      wakeLockRef.current = null
    }
  }, [])

  const ratio = servings / (defaultServings || 4)
  const doneCount = steps.filter((s) => checked[s.id]).length

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/recipes/${recipeId}`}
          className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
        >
          ← {recipeTitle}
        </Link>
        <div className="flex items-center gap-3">
          {wakeLockOn && (
            <span className="inline-flex items-center gap-1 rounded-md bg-lime-100 px-2 py-1 text-xs font-medium text-lime-700" title="המסך יישאר דלוק">
              💡 מסך דלוק
            </span>
          )}
          <span className="text-xs font-medium text-neutral-500">
            {doneCount}/{steps.length} שלבים
          </span>
        </div>
      </header>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full bg-lime-600 transition-all"
          style={{ width: `${steps.length ? (doneCount / steps.length) * 100 : 0}%` }}
        />
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
        {recipeTitle}
      </h1>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <h2 className="text-lg font-semibold">מרכיבים</h2>
          <div className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-2 py-1">
            <button
              type="button"
              className="grid h-7 w-7 place-items-center rounded-md text-lg font-bold text-neutral-700 hover:bg-neutral-100"
              aria-label="הקטנת מנות"
              onClick={() => setServings((v) => Math.max(1, v - 1))}
            >
              −
            </button>
            <div className="min-w-14 text-center">
              <p className="text-xs text-neutral-500">מנות</p>
              <p className="text-xl font-bold leading-none">{servings}</p>
            </div>
            <button
              type="button"
              className="grid h-7 w-7 place-items-center rounded-md text-lg font-bold text-neutral-700 hover:bg-neutral-100"
              aria-label="הגדלת מנות"
              onClick={() => setServings((v) => v + 1)}
            >
              +
            </button>
          </div>
        </div>
        <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
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
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">אופן ההכנה</h2>
        {ttsSupported && steps.length > 0 && (
          <div className="flex items-center gap-2">
            {readingIdx === null ? (
              <button
                type="button"
                onClick={() => speakFrom(0)}
                className="inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-lime-700"
              >
                <span aria-hidden="true">🔊</span>
                <span>הקראה של השלבים</span>
              </button>
            ) : (
              <>
                {ttsPaused ? (
                  <button
                    type="button"
                    onClick={resumeSpeech}
                    className="inline-flex items-center gap-2 rounded-lg border border-lime-600 bg-white px-3 py-2 text-sm font-semibold text-lime-700 shadow-sm transition hover:bg-lime-50"
                  >
                    ▶ המשך
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={pauseSpeech}
                    className="inline-flex items-center gap-2 rounded-lg border border-amber-400 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 shadow-sm transition hover:bg-amber-100"
                  >
                    ⏸ השהיה
                  </button>
                )}
                <button
                  type="button"
                  onClick={stopSpeech}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300"
                >
                  ■ עצור
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <ol className="mt-3 space-y-4">
        {steps.map((step, idx) => (
          <StepCard
            key={step.id}
            index={idx}
            total={steps.length}
            step={step}
            checked={!!checked[step.id]}
            isReading={readingIdx === idx && !ttsPaused}
            onToggle={() =>
              setChecked((prev) => ({ ...prev, [step.id]: !prev[step.id] }))
            }
            onSpeakThis={ttsSupported ? () => speakFrom(idx) : undefined}
          />
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/recipes/${recipeId}`}
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-neutral-700 shadow-sm hover:border-lime-500 hover:text-lime-700"
        >
          חזרה למתכון
        </Link>
        <button
          type="button"
          onClick={() => setChecked({})}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm hover:border-neutral-300"
        >
          נקה סימונים
        </button>
      </div>
    </main>
  )
}

type StepCardProps = {
  index: number
  total: number
  step: Step
  checked: boolean
  isReading?: boolean
  onToggle: () => void
  onSpeakThis?: () => void
}

function StepCard({ index, total, step, checked, isReading, onToggle, onSpeakThis }: StepCardProps) {
  const duration = step.duration_seconds ?? null
  const [timerActive, setTimerActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(duration)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const finishedRef = useRef(false)

  useEffect(() => {
    if (timerActive && timeLeft !== null && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => (t !== null && t > 0 ? t - 1 : 0))
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timerActive && timeLeft === 0 && !finishedRef.current) {
        finishedRef.current = true
        setTimerActive(false)
        setFinished(true)
        playAlertBeep()
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timerActive, timeLeft])

  function toggleTimer() {
    if (timerActive) {
      setTimerActive(false)
    } else {
      if (timeLeft === null || timeLeft === 0) {
        setTimeLeft(duration)
        finishedRef.current = false
        setFinished(false)
      }
      setTimerActive(true)
    }
  }

  const cardBorder = useMemo(() => {
    if (isReading) return 'border-sky-500 ring-2 ring-sky-100'
    if (finished) return 'border-lime-500 ring-2 ring-lime-100'
    if (timerActive) return 'border-amber-400 ring-2 ring-amber-50'
    if (checked) return 'border-neutral-200 opacity-60'
    return 'border-neutral-200'
  }, [finished, timerActive, checked, isReading])

  return (
    <li className={`rounded-xl border bg-white p-5 shadow-sm transition ${cardBorder}`}>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={checked}
          aria-label={checked ? `שלב ${index + 1} הושלם, לבטל` : `סמן שלב ${index + 1} כהושלם`}
          className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
            checked
              ? 'bg-lime-600 text-white'
              : 'border-2 border-neutral-300 bg-white text-neutral-700 hover:border-lime-500'
          }`}
        >
          {checked ? '✓' : index + 1}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              שלב {index + 1} מתוך {total}
              {duration != null && (
                <span className="text-neutral-400"> · {formatTime(duration)}</span>
              )}
            </p>
          </div>
          {step.title && (
            <p className="mt-1 text-base font-bold text-lime-700">{step.title}</p>
          )}
          <p className={`mt-2 whitespace-pre-wrap text-base leading-relaxed ${checked ? 'text-neutral-500 line-through' : 'text-neutral-900'}`}>
            {step.body}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {duration != null && (
              <>
                <button
                  type="button"
                  onClick={toggleTimer}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    timerActive
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-lime-500 hover:text-lime-700'
                  }`}
                >
                  <span aria-hidden="true">⏱</span>
                  {timerActive
                    ? `${formatTime(timeLeft ?? 0)} · השהיה`
                    : timeLeft !== null && timeLeft > 0 && timeLeft !== duration
                      ? `המשך: ${formatTime(timeLeft)}`
                      : `הפעל טיימר · ${formatTime(duration)}`}
                </button>
                {finished && (
                  <span className="inline-flex items-center gap-2 rounded-md bg-lime-100 px-2 py-1 text-xs font-semibold text-lime-800">
                    🔔 הטיימר הסתיים
                  </span>
                )}
              </>
            )}
            {onSpeakThis && (
              <button
                type="button"
                onClick={onSpeakThis}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-sky-500 hover:text-sky-700"
                title="הקרא משלב זה והלאה"
              >
                <span aria-hidden="true">🔊</span>
                הקרא מכאן
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}
