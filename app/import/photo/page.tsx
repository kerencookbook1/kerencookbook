"use client";

import Link from "next/link";
import { useState } from "react";

export default function PhotoImportPage() {
  const [stage, setStage] = useState<"upload" | "review">("upload");
  const [provider, setProvider] = useState("OpenAI Vision");
  return <main className="screen-shell">
    <header className="screen-header"><Link className="back-link" href="/recipes/new">חזרה להוספה</Link><p className="eyebrow">ייבוא מתכון</p><h1>צילום, חילוץ ואישור</h1><p>ה־OCR יוצר טיוטה בלבד. תמיד אפשר לתקן לפני השמירה.</p></header>
    {stage === "upload" ? <section className="import-layout"><div className="upload-panel"><div className="camera-frame"><span>אזור צילום</span></div><h2>צלמי דף או כרטיסיית מתכון</h2><p>אנו מסירים מידע מיקום ומכינים את התמונה לעיבוד.</p><div className="upload-actions"><button className="primary-button" type="button" onClick={() => setStage("review")}>בחירת תמונה</button><button className="outline-button" type="button" onClick={() => setStage("review")}>צילום עכשיו</button></div></div><aside className="provider-card"><p className="eyebrow">עיבוד חכם</p><h2>בחירת ספק</h2><label>ספק OCR ו-AI<select value={provider} onChange={(event) => setProvider(event.target.value)}><option>OpenAI Vision</option><option>Google Vision</option><option>Anthropic</option></select></label><p className="privacy-note">התמונה נשלחת לספק שנבחר לצורך חילוץ המתכון בלבד.</p></aside></section> : <section className="review-layout"><div className="source-preview"><div className="paper-preview"><p>עוגת לימון בחושה</p><span>2 ביצים, כוס סוכר, מיץ לימון...</span></div><p>מקור שהועלה</p></div><form className="review-form"><div className="review-status"><span>טיוטה מוכנה לבדיקה</span><small>עובד עם {provider}</small></div><label>שם המתכון<input defaultValue="עוגת לימון בחושה" /></label><label>מרכיבים<textarea rows={5} defaultValue={"2 ביצים\n1 כוס סוכר\n1/2 כוס מיץ לימון\n2 כוסות קמח"} /></label><label>שלבי הכנה<textarea rows={5} defaultValue={"1. מערבבים ביצים וסוכר.\n2. מוסיפים לימון וקמח.\n3. אופים ב-180 מעלות."} /></label><div className="review-actions"><button className="outline-button" type="button" onClick={() => setStage("upload")}>בחירת תמונה אחרת</button><Link className="primary-button" href="/recipes/1/cook">אישור ושמירה</Link></div></form></section>}
  </main>;
}
