import Link from "next/link";

const variables = [
  "NEXT_PUBLIC_SUPABASE_URL=",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=",
  "SUPABASE_SERVICE_ROLE_KEY=",
  "AI_PROVIDER_OPENAI_API_KEY=",
];

export default function ConnectionsPage() {
  return <main className="screen-shell connections-page"><header className="screen-header"><Link className="back-link" href="/profile">חזרה לפרופיל</Link><p className="eyebrow">הגדרות מערכת</p><h1>חיבורים ומפתחות</h1><p>החיבורים נשמרים מקומית בקובץ `.env.local` ולא נשלחים לדפדפן או נשמרים ב־Git.</p></header><section className="connection-grid"><article className="connection-card"><div className="connection-mark supabase-mark">S</div><p className="eyebrow">מסד נתונים וחיבור משתמשים</p><h2>Supabase</h2><p>צרי פרויקט, העתיקי את כתובת הפרויקט ואת ה־publishable key, והזיני אותם בקובץ המקומי.</p><a className="primary-button" href="https://supabase.com/dashboard/new" target="_blank" rel="noreferrer">יצירת פרויקט Supabase (נפתח בחלון חדש)</a></article><article className="connection-card"><div className="connection-mark ai-mark">AI</div><p className="eyebrow">OCR ועיבוד מתכונים</p><h2>OpenAI</h2><p>צרי מפתח API ב־OpenAI והדביקי אותו במשתנה `AI_PROVIDER_OPENAI_API_KEY` בלבד.</p><a className="primary-button" href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">יצירת מפתח API ב־OpenAI (נפתח בחלון חדש)</a></article></section><section className="env-instructions"><div><p className="eyebrow">שלב אחרון</p><h2>הזנת המפתחות</h2><p>פתחי את `.env.local` בשורש הפרויקט והחליפי את הערכים הריקים. לאחר שמירה, הפעילי מחדש את `npm run dev`.</p></div><pre aria-label="משתני סביבה להזנה"><code>{variables.join("\n")}</code></pre></section><aside className="security-callout"><strong>חשוב:</strong> אין להדביק מפתח API בטופס באתר או בקובץ `.env.example`. רק `.env.local` במחשב שלך או משתני הסביבה של Vercel בפריסה.</aside></main>;
}
