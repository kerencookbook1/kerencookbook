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
      'רקע קרם חם, טרקוטה כצבע ראשי, זית עמוק כמשני. כותרות ב-serif נשי-מודרני. כרטיסים גדולים עם צל רך, פינות מעוגלות חזק. מרגיש כמו ספר מתכונים אישי.',
  },
  {
    id: 'b',
    name: 'Editorial Minimal',
    tagline: 'מגזין נקי, אוכל בגיבור',
    href: '/preview/design-b',
    swatch: ['#ffffff', '#0a0a0a', '#3d5a2c', '#ececec'],
    font: 'Playfair Display + Inter',
    summary:
      'לבן צח, שחור, ירוק זית אחד יחיד. כותרות ענקיות ב-Playfair (עד 72px). ללא צלים, רק תמונות וקווים. סגנון NYT Cooking / Bon Appétit.',
  },
  {
    id: 'c',
    name: 'Modern Fresh',
    tagline: 'חד, קליל, SaaS',
    href: '/preview/design-c',
    swatch: ['#fafaf9', '#ffffff', '#65a30d', '#171717'],
    font: 'Geist Sans',
    summary:
      'רקע אפור בהיר, כרטיסים בלבן עם border עדין, אקסנט ירוק לימוני. סטטיסטיקות בראש, tabs לפילטרים, badge על כרטיסים. סגנון Notion/Linear.',
    favorite: true,
  },
  {
    id: 'd',
    name: 'Japandi',
    tagline: 'שקט, מינימלי, יפני-סקנדינבי',
    href: '/preview/design-d',
    swatch: ['#f7f5f0', '#d4b896', '#8a7c6b', '#2b2620'],
    font: 'Noto Serif Display + Noto Sans',
    summary:
      'אף-לבן חמים, טונים של עץ טבעי, הכי הרבה מרחב פנוי מכל הכיוונים. תמונות בפרופורציה של פוסטר יפני (4:5). ללא צלים, ללא רקעים לכרטיסים. שקט טוטאלי, האוכל בלבד.',
  },
  {
    id: 'e',
    name: 'Dark Bistro',
    tagline: 'כהה, זהב, תפריט מסעדה',
    href: '/preview/design-e',
    swatch: ['#151816', '#1e2320', '#c9a961', '#e8dcc4'],
    font: 'Cormorant Garamond + Inter',
    summary:
      'רקע ירוק-שחור עמוק, טקסט קרם, זהב כאקסנט יחיד. כותרות ב-Cormorant (serif אלגנטי כמעט אמנותי). התמונות זוהרות על הרקע הכהה. מרגיש כמו תפריט של מישלן.',
  },
  {
    id: 'f',
    name: 'Vintage Cookbook',
    tagline: 'רטרו, אוכר-אדום, ספר משפחתי',
    href: '/preview/design-f',
    swatch: ['#fdf3e0', '#a83232', '#d89b3a', '#3a2818'],
    font: 'DM Serif Display + Nunito',
    summary:
      'רקע קרם עם דוט פטרן עדין, אדום ואוכר, מסגרות חזקות סביב כל כרטיס עם צל דוגמת ספר ישן, מספרי מתכון בסטיקרים, קישוטים (❦, ✿) בסוף כל בלוק. סגנון של Betty Crocker / ספר מתכונים ישן של סבתא — אבל נקי.',
  },
]

export default function DesignsIndexPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900" dir="rtl">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            תצוגה מקדימה
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            בחירת עיצוב
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            6 הצעות ויזואליות שונות לגמרי. כל אחת מציגה את אותם 6 מתכונים באותה שפה תוכנית — אבל בגישה עיצובית אחרת.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {DESIGNS.map((d) => (
            <Link
              key={d.id}
              href={d.href}
              className="group relative block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              style={{
                borderColor: d.favorite ? '#65a30d' : '#e5e5e5',
                boxShadow: d.favorite ? '0 0 0 3px #ecfccb' : undefined,
              }}
            >
              {d.favorite && (
                <span
                  className="absolute -top-3 right-4 rounded-full px-3 py-1 text-xs font-bold text-white shadow"
                  style={{ background: '#65a30d' }}
                >
                  ★ המועדף עד כה
                </span>
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-bold text-white">
                      עיצוב {d.id}
                    </span>
                    <h2 className="text-xl font-bold">{d.name}</h2>
                  </div>
                  <p className="mt-1 text-xs font-medium text-neutral-500">
                    {d.tagline}
                  </p>
                </div>
                <div className="flex gap-1">
                  {d.swatch.map((c) => (
                    <span
                      key={c}
                      className="h-7 w-7 rounded-full border border-neutral-200"
                      style={{ background: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                {d.summary}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                <p className="text-[11px] font-medium text-neutral-400">
                  {d.font}
                </p>
                <span className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition group-hover:bg-neutral-700">
                  צפייה במוקאפ →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-white p-5 text-sm text-neutral-600">
          💡 <strong>אחרי שתחליט:</strong> תגיד לי איזו אות בחרת (א/ב/ג/ד/ה/ו) —
          או צירוף (למשל &quot;ד אבל בצבעים של ה&quot;) — ואני אחיל את זה על כל האתר.
          המוקאפים ימחקו בסוף.
        </div>
      </div>
    </div>
  )
}
