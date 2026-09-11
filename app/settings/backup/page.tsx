import Link from 'next/link'
import { BackupPanel } from './_panel'

export const metadata = { title: 'גיבוי ושחזור — המטבח של קרן' }

export default function BackupSettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8" dir="rtl">
      <Link href="/profile" className="text-xs font-medium text-neutral-500 hover:text-neutral-900">
        ← הפרופיל שלי
      </Link>

      <header className="mt-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          הגדרות · גיבוי ושחזור
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          גיבוי ושחזור
        </h1>
        <p className="mt-2 text-base text-neutral-600">
          הורידי גיבוי לוקאלי של המידע שלך כדי שיהיה עותק על המחשב או בענן פרטי. השחזור מייבא כל מתכון כרשומה חדשה — לא מוחק ולא דורס נתונים קיימים.
        </p>
      </header>

      <BackupPanel />

      <aside className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
        <p className="font-semibold text-neutral-900">מה נכלל בכל סוג גיבוי?</p>
        <ul className="mt-2 list-disc space-y-1 pr-4">
          <li><strong>גיבוי מתכונים בלבד</strong> — כל המתכונים שלך עם מרכיבים, שלבים ותמונות (קישורים).</li>
          <li><strong>גיבוי מלא</strong> — כל המתכונים + רשימת קניות + תכנון ארוחות + פרטי פרופיל.</li>
          <li>מפתחות API של ספקי AI, הגדרות ערכה וסיסמאות <em>אינם</em> כלולים בגיבוי מטעמי אבטחה.</li>
        </ul>
      </aside>
    </main>
  )
}
