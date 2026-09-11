import Link from 'next/link'

export const metadata = { title: 'בחירת עיצוב — המטבח של קרן' }

const DESIGNS = [
  {
    id: 'a',
    name: 'Warm Kitchen',
    tagline: 'חמים, בוטני, ים תיכוני',
    href: '/preview/design-a',
    swatch: ['#fdf6ec', '#c94f2b', '#5f7548', '#1f1611'],
    font: 'Fraunces + Inter',
    summary:
      'רקע קרם חם, טרקוטה כצבע ראשי, זית עמוק כמשני. כותרות ב-serif נשי-מודרני. כרטיסים גדולים עם צל רך, פינות מעוגלות חזק, תגיות בגוונים חמים. מרגיש כמו ספר מתכונים אישי.',
  },
  {
    id: 'b',
    name: 'Editorial Minimal',
    tagline: 'מגזין נקי, אלגנטי, אוכל בגיבור',
    href: '/preview/design-b',
    swatch: ['#ffffff', '#0a0a0a', '#3d5a2c', '#ececec'],
    font: 'Playfair Display + Inter',
    summary:
      'לבן צח, שחור, ירוק זית אחד יחיד. כותרות ענקיות ב-serif קלאסי (עד 72px). ללא צלים, ללא רקעים לכרטיסים — רק תמונות, כותרות ופסים דקים. הרבה white-space. סגנון NYT Cooking / Bon Appétit.',
  },
  {
    id: 'c',
    name: 'Modern Fresh',
    tagline: 'חד, קליל, סגנון SaaS',
    href: '/preview/design-c',
    swatch: ['#fafaf9', '#ffffff', '#65a30d', '#171717'],
    font: 'Geist Sans',
    summary:
      'רקע אפור בהיר, כרטיסים בלבן עם border עדין, אקסנט ירוק לימוני. פינות `rounded-lg` (לא ענק), צל דק. סטטיסטיקות בראש, tabs לפילטרים, toggle לדיאטטי, badge על כרטיסים. סגנון Notion/Linear.',
  },
]

export default function DesignsIndexPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900" dir="rtl">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            תצוגה מקדימה
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            בחרי עיצוב
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            שלוש הצעות ויזואליות שונות לגמרי לאתר. כל אחת מציגה את אותם 6 מתכונים באותה שפה — אבל בגישה עיצובית אחרת.
          </p>
        </header>

        <div className="mt-10 space-y-4">
          {DESIGNS.map((d) => (
            <Link
              key={d.id}
              href={d.href}
              className="block rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white">
                      עיצוב {d.id}
                    </span>
                    <h2 className="text-2xl font-bold">{d.name}</h2>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">{d.tagline}</p>
                  <p className="mt-4 text-base leading-relaxed text-neutral-700">
                    {d.summary}
                  </p>
                  <p className="mt-3 text-xs font-medium text-neutral-400">
                    גופנים: {d.font}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex gap-1.5">
                    {d.swatch.map((c) => (
                      <span
                        key={c}
                        className="h-8 w-8 rounded-full border border-neutral-200"
                        style={{ background: c }}
                        title={c}
                      />
                    ))}
                  </div>
                  <span className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white">
                    צפייה במוקאפ →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-white p-5 text-sm text-neutral-600">
          💡 <strong>אחרי שתחליט:</strong> תגיד לי איזה מספר בחרת ואני אמיר את
          כל האתר לפי אותו עיצוב. המוקאפים האלה יימחקו בסוף — הם רק לצפייה.
        </div>
      </div>
    </div>
  )
}
