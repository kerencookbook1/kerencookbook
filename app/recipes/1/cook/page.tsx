"use client";

import Link from "next/link";
import { useState } from "react";

const steps = ["מחממים תנור ל-180 מעלות ומשמנים תבנית.", "טורפים ביצים וסוכר עד שהתערובת בהירה.", "מוסיפים לימון, קמח ושמן ומערבבים בעדינות.", "אופים כ-35 דקות, עד שקיסם יוצא יבש."];

export default function CookPage() {
  const [current, setCurrent] = useState(0);
  const [servings, setServings] = useState(4);
  const [timer, setTimer] = useState(false);
  return <main className="cook-shell">
    <header className="cook-header"><Link className="back-link" href="/recipes">סיום בישול</Link><span>עוגת לימון בחושה</span><button type="button" className="timer-toggle" aria-pressed={timer} onClick={() => setTimer((value) => !value)}>{timer ? "הטיימר פועל" : "הפעלת טיימר"}</button></header>
    <div className="cook-progress" aria-label={`שלב ${current + 1} מתוך ${steps.length}`}><span style={{ width: `${((current + 1) / steps.length) * 100}%` }} /></div>
    <section className="cook-grid"><aside className="ingredients-panel"><p className="eyebrow">מרכיבים</p><div className="servings"><span>מנות</span><button type="button" aria-label="הקטנת מנות" onClick={() => setServings((value) => Math.max(1, value - 1))}>-</button><strong>{servings}</strong><button type="button" aria-label="הגדלת מנות" onClick={() => setServings((value) => value + 1)}>+</button></div><ul><li>{servings / 4} כוס סוכר</li><li>{servings / 2} ביצים</li><li>{servings / 8} כוס מיץ לימון</li><li>{servings / 2} כוסות קמח</li></ul></aside><article className="cook-step"><p className="eyebrow">שלב {current + 1} מתוך {steps.length}</p><h1>{steps[current]}</h1><div className="step-actions"><button className="outline-button" type="button" disabled={current === 0} onClick={() => setCurrent((value) => value - 1)}>הקודם</button><button className="primary-button" type="button" onClick={() => setCurrent((value) => Math.min(steps.length - 1, value + 1))}>{current === steps.length - 1 ? "סיימתי" : "לשלב הבא"}</button></div></article></section>
  </main>;
}
