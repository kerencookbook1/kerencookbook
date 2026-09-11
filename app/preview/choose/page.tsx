import Link from 'next/link'

export const metadata = { title: 'בחירת כיוון עיצוב · המטבח של קרן' }

const DIRECTIONS = [
  {
    slug: 'editorial',
    title: 'Editorial Cookbook',
    tag: 'מגזין · Serif · חם',
    desc: 'ספר בישול-מדפיס. כותרות Fraunces ענקיות, פלטה קרם/בורדו, drop caps, גריד א-סימטרי.',
    vibe: 'NYT Cooking · Kinfelk',
    bg: 'linear-gradient(135deg, #FBF7F0 0%, #F3EBDD 100%)',
    fg: '#2A1810',
    accent: '#7A1F2B',
    accentBg: '#7A1F2B',
    accentTxt: '#FBF7F0',
    face: 'Fraunces',
    swatches: ['#FBF7F0', '#7A1F2B', '#B8442E', '#2A1810'],
  },
  {
    slug: 'bento',
    title: 'Warm Bento',
    tag: 'ידידותי · Rounded · חמים',
    desc: 'משבצות שמנות בגדלים שונים. פינות 24px, צל כפול, spring bounce, פלטה חמימה של מטבח.',
    vibe: 'Duolingo · Notion · Airbnb',
    bg: 'linear-gradient(135deg, #FFFBEB 0%, #FEE2E2 100%)',
    fg: '#431407',
    accent: '#DC2626',
    accentBg: '#DC2626',
    accentTxt: '#FFFDF7',
    face: 'Fraunces + Nunito',
    swatches: ['#FFFBEB', '#DC2626', '#84CC16', '#F59E0B'],
  },
  {
    slug: 'cinematic',
    title: 'Cinematic Dark',
    tag: 'כהה · Streaming · דרמטי',
    desc: 'רקע שחור, תמונות ענק עם vignette + Ken Burns. Instrument Serif Italic, Geist Mono, זהב חם.',
    vibe: 'Chef\'s Table · Apple TV · Cereal',
    bg: 'linear-gradient(135deg, #0A0A0A 0%, #171717 100%)',
    fg: '#FAFAF9',
    accent: '#F59E0B',
    accentBg: '#F59E0B',
    accentTxt: '#0A0A0A',
    face: 'Instrument Serif + Geist Mono',
    swatches: ['#0A0A0A', '#171717', '#F59E0B', '#FEF3C7'],
  },
  {
    slug: 'brutal',
    title: 'Neo-Brutalist Kitchen',
    tag: 'עז · Bold · Punk',
    desc: 'גבולות שחורים עבים, צללים קשים 4px, פלטה עזה (מוסטרד/פינק/ליים), Space Grotesk + JetBrains Mono.',
    vibe: 'Vercel Ship · Gumroad · GitHub',
    bg: 'linear-gradient(135deg, #FFFDF7 0%, #FEF3C7 100%)',
    fg: '#0A0A0A',
    accent: '#EC4899',
    accentBg: '#0A0A0A',
    accentTxt: '#EAB308',
    face: 'Space Grotesk + Mono',
    swatches: ['#FFFDF7', '#0A0A0A', '#EAB308', '#EC4899'],
  },
]

export default function ChooseDesign() {
  return (
    <div className="min-h-screen" style={{ background: '#0F0F0F', color: '#FAFAF9', fontFamily: '"Inter", "Heebo", sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
        .ch-serif { font-family: 'Instrument Serif', serif; }
        .ch-tile { transition: transform .35s cubic-bezier(.2,.7,.2,1); }
        .ch-tile:hover { transform: translateY(-6px); }
        .ch-preview { transition: transform 1.2s cubic-bezier(.2,.7,.2,1); }
        .ch-tile:hover .ch-preview { transform: scale(1.03); }
        @keyframes chFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .ch-fade { animation: chFade .8s cubic-bezier(.2,.7,.2,1) both; }
      `}</style>

      {/* ═══════════ HEADER ═══════════ */}
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-[1320px] px-8 py-6 flex items-center justify-between">
          <div className="ch-serif text-2xl">המטבח <span className="italic" style={{ color: '#F59E0B' }}>של קרן</span></div>
          <div className="text-xs uppercase tracking-widest" style={{ color: '#737373' }}>Preview · Design Selection</div>
        </div>
      </header>

      {/* ═══════════ INTRO ═══════════ */}
      <section className="mx-auto max-w-[1320px] px-8 py-16 ch-fade">
        <div className="text-xs uppercase tracking-[.3em] mb-4" style={{ color: '#F59E0B' }}>Round 02 · Design Directions</div>
        <h1 className="ch-serif leading-[.95] mb-6" style={{ fontSize: 'clamp(56px, 8vw, 112px)' }}>
          ארבעה כיוונים.<br /><span className="italic" style={{ color: '#F59E0B' }}>אחד יהיה האתר שלך.</span>
        </h1>
        <p className="text-lg max-w-2xl" style={{ color: '#A3A3A3', lineHeight: 1.6 }}>
          כל כיוון הוא עמוד מלא (בית + כרטיסי מתכון + מסך מתכון בודד) בשפה עיצובית שונה לחלוטין. עברי בין ה-4, גלגלי, ותגידי לי איזה מהם מדבר אלייך. אחרי הבחירה — נלטש ונחיל על כל האתר.
        </p>
      </section>

      {/* ═══════════ 4 DIRECTIONS GRID ═══════════ */}
      <section className="mx-auto max-w-[1320px] px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DIRECTIONS.map((d, i) => (
            <Link
              key={d.slug}
              href={`/preview/design-${d.slug}`}
              className="ch-tile ch-fade block rounded-3xl overflow-hidden border border-white/10 relative"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Preview surface */}
              <div className="relative overflow-hidden" style={{ height: 340, background: d.bg }}>
                <div className="ch-preview absolute inset-0 flex flex-col justify-center px-10">
                  <div className="text-[10px] uppercase tracking-[.25em] mb-3" style={{ color: d.accent }}>{d.tag}</div>
                  <div className="mb-4" style={{ fontFamily: d.slug === 'brutal' ? '"Space Grotesk", sans-serif' : (d.slug === 'cinematic' || d.slug === 'editorial' ? '"Instrument Serif", serif' : '"Fraunces", serif'),
                    fontSize: 68, lineHeight: .9, fontWeight: d.slug === 'brutal' ? 700 : (d.slug === 'cinematic' ? 400 : 700),
                    color: d.fg, letterSpacing: '-.02em' }}>
                    {d.slug === 'brutal' ? 'מה אוכלים?' :
                     d.slug === 'cinematic' ? <>סלמון,<br /><span className="italic" style={{ color: d.accent }}>עשן.</span></> :
                     d.slug === 'editorial' ? <>שקשוקה,<br /><span className="italic" style={{ color: d.accent }}>לאט.</span></> :
                     'מה מבשלים?'}
                  </div>
                  <div className="flex gap-2">
                    <span className="px-4 py-2 rounded text-xs font-semibold"
                      style={{ background: d.accentBg, color: d.accentTxt, borderRadius: d.slug === 'brutal' ? 0 : 8,
                        border: d.slug === 'brutal' ? '2px solid #0A0A0A' : 'none',
                        boxShadow: d.slug === 'brutal' ? '3px 3px 0 0 #0A0A0A' : 'none' }}>
                      התחילי לבשל
                    </span>
                    <span className="px-4 py-2 rounded text-xs font-semibold"
                      style={{ background: 'transparent', color: d.fg, border: `1.5px solid ${d.fg}30`,
                        borderRadius: d.slug === 'brutal' ? 0 : 8 }}>
                      דלגי
                    </span>
                  </div>
                </div>
              </div>

              {/* Description panel */}
              <div className="p-6 flex flex-col gap-4" style={{ background: '#171717' }}>
                <div className="flex items-baseline justify-between">
                  <h3 className="ch-serif text-3xl">{d.title}</h3>
                  <span className="text-xs uppercase tracking-wider" style={{ color: '#737373' }}>0{i+1} / 04</span>
                </div>
                <p className="text-sm" style={{ color: '#D4D4D4', lineHeight: 1.55 }}>{d.desc}</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="text-xs" style={{ color: '#A3A3A3' }}>
                    <span style={{ color: '#F59E0B' }}>▷</span> {d.vibe} · {d.face}
                  </div>
                  <div className="flex gap-1">
                    {d.swatches.map((sw, j) => (
                      <span key={j} className="w-5 h-5 rounded-full border border-white/20" style={{ background: sw }} />
                    ))}
                  </div>
                </div>
                <div className="text-sm font-semibold mt-1" style={{ color: '#F59E0B' }}>
                  פתחי את הכיוון המלא →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-8">
          <div className="text-sm max-w-lg" style={{ color: '#A3A3A3' }}>
            {'כשתבחרי כיוון — תגידי לי בצ\'אט (למשל "בחרתי Cinematic"), ואני אבנה variantions נוספים בתוך אותו כיוון, או אתחיל להחיל אותו על מסכי האתר האמיתיים.'}
          </div>
          <div className="flex gap-3">
            <Link href="/preview" className="px-6 py-3 rounded-full text-sm font-semibold border border-white/20 hover:bg-white/5 transition-colors">
              ← חזרה ל-Design C הנוכחי
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
