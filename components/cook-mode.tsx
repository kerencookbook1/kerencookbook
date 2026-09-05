"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentStep = steps[current]
  const stepDuration = currentStep?.duration_seconds ?? null

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimerActive(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimeLeft(stepDuration)
  }, [current, stepDuration])

  useEffect(() => {
    if (timerActive && timeLeft !== null && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => (t !== null && t > 0 ? t - 1 : 0))
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (timerActive && timeLeft === 0) setTimerActive(false)
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
