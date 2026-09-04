import Link from "next/link";

export default function NewRecipePage() {
  return <main className="screen-shell">
    <header className="screen-header"><Link className="back-link" href="/recipes">חזרה למתכונים</Link><p className="eyebrow">מתכון חדש</p><h1>בואי נתחיל לבשל</h1><p>אפשר לכתוב ידנית, לצלם דף מתכון או לייבא מקישור.</p></header>
    <section className="source-grid" aria-label="בחירת דרך הוספת מתכון">
      <Link className="source-card primary-source" href="/import/photo"><span className="source-number">01</span><h2>צלמי מתכון</h2><p>העלי תמונה, נחלץ את הטקסט ונכין טיוטה לעריכה.</p><span>פתיחת מצלמה</span></Link>
      <article className="source-card"><span className="source-number">02</span><h2>הזנה ידנית</h2><p>כתבי מתכון משלך עם מרכיבים, שלבים וזמני הכנה.</p><button type="button" className="outline-button">פתיחת עורך</button></article>
      <article className="source-card"><span className="source-number">03</span><h2>ייבוא מקישור</h2><p>הדביקי כתובת של מתכון ונארגן אותו עבורך.</p><button type="button" className="outline-button">ייבוא URL</button></article>
    </section>
    <section className="manual-editor"><div><p className="eyebrow">טיוטה ידנית</p><h2>פרטי המתכון</h2></div><label>שם המתכון<input placeholder="לדוגמה: פסטה של שישי" /></label><div className="form-grid"><label>מספר מנות<input inputMode="numeric" placeholder="4" /></label><label>זמן הכנה<input placeholder="45 דקות" /></label></div><label>תיאור קצר<textarea placeholder="מה מיוחד במתכון הזה?" rows={3} /></label><button className="primary-button" type="button">שמירת טיוטה</button></section>
  </main>;
}
