"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

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
  } catch { /* audio might be blocked — silent fallback */ }
  try { navigator.vibrate?.([220, 90, 220]); } catch { /* not available */ }
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
  const [current, setCurrent] = useState(0)
  const [servings, setServings] = useState(defaultServings || 4)
  const [timerActive, setTimerActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [wakeLockOn, setWakeLockOn] = useState(false)
  const [timerFinished, setTimerFinished] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const finishedRef = useRef(false)

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
      } catch { /* permission denied or not supported */ }
    })()
    // Re-acquire when tab becomes visible again
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

  const currentStep = steps[current]
  const stepDuration = currentStep?.duration_seconds ?? null

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimerActive(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimeLeft(stepDuration)
    setTimerFinished(false)
    finishedRef.current = false
  }, [current, stepDuration])

  useEffect(() => {
    if (timerActive && timeLeft !== null && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => (t !== null && t > 0 ? t - 1 : 0))
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (timerActive && timeLeft === 0 && !finishedRef.current) {
        finishedRef.current = true
        setTimerActive(false)
        setTimerFinished(true)
        playAlertBeep()
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerActive, timeLeft])

  function startTimer() {
    if (stepDuration && timeLeft === null) setTimeLeft(stepDuration)
    setTimerActive(true)
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const ratio = servings / (defaultServings || 4)

  return (
    <main className="cook-shell">
      <header className="cook-header">
        <Link className="back-link" href={`/recipes/${recipeId}`}>← {recipeTitle}</Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {wakeLockOn && (
            <span title="המסך יישאר דלוק" style={{ fontSize: '.75rem', color: '#a8dea8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              💡 מסך דלוק
            </span>
          )}
          {stepDuration !== null && (
            <button
              type="button"
              className="timer-toggle"
              aria-pressed={timerActive}
              onClick={() => timerActive ? setTimerActive(false) : startTimer()}
            >
              {timerActive ? `${formatTime(timeLeft ?? stepDuration)} ⏸` : 'הפעלת טיימר'}
            </button>
          )}
        </div>
      </header>

      {/* Progress bar */}
      <div
        className="cook-progress"
        role="progressbar"
        aria-valuenow={current + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={`שלב ${current + 1} מתוך ${steps.length}`}
      >
        <span style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
      </div>

      {/* Timer overlay */}
      {timerActive && timeLeft !== null && (
        <div style={{
          textAlign: 'center',
          marginBottom: 24,
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(4rem, 12vw, 8rem)',
          lineHeight: 1,
          color: timeLeft <= 10 ? '#f47a5a' : '#fffaf2',
          letterSpacing: '-.04em',
        }}>
          {formatTime(timeLeft)}
          <p style={{ fontSize: '1rem', color: '#c8b8a5', fontFamily: 'sans-serif', margin: '8px 0 0' }}>
            טיימר פועל
          </p>
        </div>
      )}

      {/* Timer finished banner */}
      {timerFinished && (
        <div
          role="alert"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            marginBottom: 24, padding: '14px 20px', borderRadius: 14,
            background: '#3b6035', border: '2px solid #7bbf6a', color: '#fffaf2',
          }}
        >
          <span style={{ fontWeight: 800 }}>🔔 הטיימר של השלב הסתיים!</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="outline-button"
              style={{ borderColor: '#a8dea8', color: '#fffaf2', minHeight: 36 }}
              onClick={() => setTimerFinished(false)}
            >
              הבנתי
            </button>
            {current < steps.length - 1 && (
              <button
                type="button"
                className="primary-button"
                style={{ minHeight: 36 }}
                onClick={() => { setTimerFinished(false); setCurrent((v) => v + 1) }}
              >
                לשלב הבא ←
              </button>
            )}
          </div>
        </div>
      )}

      <section className="cook-grid">
        {/* Ingredients panel */}
        <aside className="ingredients-panel">
          <p className="eyebrow">מרכיבים</p>
          <div className="servings">
            <span>מנות</span>
            <button type="button" aria-label="הקטנת מנות" onClick={() => setServings((v) => Math.max(1, v - 1))}>-</button>
            <strong>{servings}</strong>
            <button type="button" aria-label="הגדלת מנות" onClick={() => setServings((v) => v + 1)}>+</button>
          </div>
          <ul>
            {ingredients.map((ing) => (
              <li key={ing.id}>
                {ing.amount && (
                  <strong style={{ color: '#f2c1a3' }}>
                    {/* Simple ratio scaling for numeric amounts */}
                    {(() => {
                      const num = parseFloat(ing.amount ?? '')
                      return !isNaN(num) ? (Math.round(num * ratio * 4) / 4).toString() : ing.amount
                    })()}
                  </strong>
                )}
                {ing.unit && <span style={{ color: '#c8b8a5' }}> {ing.unit}</span>}
                {' '}{ing.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Step */}
        <article className="cook-step">
          <p className="eyebrow" style={{ color: '#c8b8a5' }}>
            שלב {current + 1} מתוך {steps.length}
          </p>
          {currentStep?.title && (
            <p style={{ color: '#f2c1a3', margin: '4px 0 12px', fontWeight: 800 }}>{currentStep.title}</p>
          )}
          <h1>{currentStep?.body}</h1>

          {stepDuration !== null && !timerActive && (
            <button
              type="button"
              className="outline-button"
              style={{ marginTop: 24, borderColor: '#776d61', color: '#fffaf2' }}
              onClick={startTimer}
            >
              {`⏱ ${formatTime(stepDuration)}`}
            </button>
          )}

          <div className="step-actions">
            <button
              className="outline-button"
              type="button"
              disabled={current === 0}
              onClick={() => setCurrent((v) => v - 1)}
              style={{ borderColor: '#776d61', color: '#fffaf2' }}
            >
              הקודם
            </button>
            {current < steps.length - 1 ? (
              <button
                className="primary-button"
                type="button"
                onClick={() => setCurrent((v) => v + 1)}
              >
                לשלב הבא
              </button>
            ) : (
              <Link href={`/recipes/${recipeId}`} className="primary-button" style={{ textDecoration: 'none' }}>
                סיימתי! 🎉
              </Link>
            )}
          </div>
        </article>
      </section>
    </main>
  )
}
