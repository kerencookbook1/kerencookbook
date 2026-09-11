'use client'

import { useRef, useState } from 'react'

type RestoreResult = {
  ok: boolean
  importedRecipes: number
  importedShopping: number
  importedMeals: number
  error?: string
}

export function BackupPanel() {
  const [busy, setBusy] = useState(false)
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const [confirmName, setConfirmName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setRestoreError(null)
    setRestoreResult(null)
    setBusy(true)
    try {
      const text = await file.text()
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: text,
      })
      const data = await res.json()
      if (!res.ok) {
        setRestoreError(data?.error ?? 'שחזור נכשל')
      } else {
        setRestoreResult(data)
      }
    } catch (err) {
      setRestoreError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {/* Recipes-only download */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-lg">📖</span>
          <h2 className="text-base font-semibold">גיבוי מתכונים</h2>
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          קובץ JSON עם כל המתכונים שלך (מרכיבים, שלבים, תמונות). מתאים להעברה בין חשבונות או שמירה כארכיון.
        </p>
        <a
          href="/api/backup/recipes"
          download
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-lime-600 bg-white px-4 py-2.5 text-sm font-semibold text-lime-700 shadow-sm transition hover:bg-lime-50"
        >
          ⬇ הורדת גיבוי מתכונים
        </a>
      </section>

      {/* Full backup download */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-lg">🗄️</span>
          <h2 className="text-base font-semibold">גיבוי מלא</h2>
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          כל המידע שלך: מתכונים + רשימת קניות + תכנון ארוחות + פרטי פרופיל. קובץ אחד לגיבוי מקיף.
        </p>
        <a
          href="/api/backup/full"
          download
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-lime-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-lime-700"
        >
          ⬇ הורדת גיבוי מלא
        </a>
      </section>

      {/* Restore */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm md:col-span-2">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-lg">↻</span>
          <h2 className="text-base font-semibold">שחזור מקובץ גיבוי</h2>
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          בחר קובץ JSON שהורדת מכאן. השחזור מוסיף את הרשומות כחדשות ואינו דורס נתונים קיימים —
          אם תעלה את אותו קובץ פעמיים, יופיעו מתכונים כפולים.
        </p>

        <p className="mt-4 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
          <strong>אישור:</strong> הקלד את המילה <code className="rounded bg-white px-1 py-0.5">שחזור</code> כדי לפתוח את בחירת הקובץ.
        </p>
        <input
          type="text"
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          placeholder="הקלד: שחזור"
          className="mt-2 w-40 rounded-lg border border-neutral-200 bg-white p-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={confirmName.trim() !== 'שחזור' || busy}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition enabled:hover:border-lime-500 enabled:hover:text-lime-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            📂 בחר קובץ JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
          {busy && <span className="text-sm text-neutral-500">מעלה ומייבא…</span>}
        </div>

        {restoreError && (
          <div role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-900">
            שגיאה: {restoreError}
          </div>
        )}
        {restoreResult && !restoreError && (
          <div className="mt-4 rounded-lg bg-lime-50 p-3 text-sm text-lime-900">
            <strong>בוצע.</strong>{' '}
            {restoreResult.importedRecipes > 0 && (
              <>נוספו {restoreResult.importedRecipes} מתכונים · </>
            )}
            {restoreResult.importedShopping > 0 && (
              <>{restoreResult.importedShopping} פריטי קניות · </>
            )}
            {restoreResult.importedMeals > 0 && (
              <>{restoreResult.importedMeals} תכנוני ארוחה</>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
