"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createRecipe } from "@/lib/actions/recipes";

type ExtractedRecipe = {
  title: string;
  description?: string | null;
  category?: string | null;
  servings?: number | null;
  prep_minutes?: number | null;
  cook_minutes?: number | null;
  ingredients: string[];
  steps: string[];
  provider?: string;
  raw_text?: string | null;
  recognition_failed?: boolean;
  reason?: string | null;
};

export default function PhotoImportPage() {
  const [stage, setStage] = useState<"upload" | "loading" | "review">("upload");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<ExtractedRecipe | null>(null);
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setStage("loading");

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/scan", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `שגיאה ${res.status}`);
      }
      const extracted = data as ExtractedRecipe;
      setRecipe(extracted);
      setTitle(extracted.title || "");
      setIngredients((extracted.ingredients || []).join("\n"));
      setSteps((extracted.steps || []).map((s, i) => `${i + 1}. ${s}`).join("\n"));
      setStage("review");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStage("upload");
    }
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setRecipe(null);
    setError(null);
    setSaveError(null);
    setStage("upload");
  }

  async function handleSave() {
    setSaveError(null);
    setSaving(true);
    try {
      const ingredientItems = ingredients
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => ({ name: line, amount: "", unit: "" }));

      const stepItems = steps
        .split("\n")
        .map((line) => line.trim().replace(/^\d+[\.\)]\s*/, ""))
        .filter(Boolean)
        .map((body) => ({ title: "", body, durationSeconds: null }));

      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", recipe?.description ?? "");
      if (recipe?.category) fd.append("category", recipe.category);
      if (recipe?.prep_minutes != null) fd.append("prepTime", String(recipe.prep_minutes));
      if (recipe?.cook_minutes != null) fd.append("cookTime", String(recipe.cook_minutes));
      if (recipe?.servings != null) fd.append("servings", String(recipe.servings));
      fd.append("ingredientsJson", JSON.stringify(ingredientItems));
      fd.append("stepsJson", JSON.stringify(stepItems));

      const result = await createRecipe(null, fd);
      if (result?.error) setSaveError(result.error);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("NEXT_REDIRECT")) setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="screen-shell">
      <header className="screen-header">
        <Link className="back-link" href="/recipes/new">חזרה להוספה</Link>
        <p className="eyebrow">ייבוא מתכון</p>
        <h1>צילום, חילוץ ואישור</h1>
        <p>ה־AI יוצר טיוטה בלבד. תמיד אפשר לתקן לפני השמירה.</p>
      </header>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />

      {stage === "upload" && (
        <section className="import-layout">
          <div className="upload-panel">
            <div className="camera-frame"><span>אזור צילום</span></div>
            <h2>צלמי דף או כרטיסיית מתכון</h2>
            <p>התמונה תישלח לספק ה־AI המוגדר לצורך חילוץ המתכון בלבד.</p>
            {error && (
              <div role="alert" style={{ margin: "12px 0", padding: 12, borderRadius: 12, background: "#fdecea", color: "#8a1c14", fontSize: ".9rem" }}>
                {error}
              </div>
            )}
            <div className="upload-actions">
              <button className="primary-button" type="button" onClick={() => cameraInputRef.current?.click()}>צילום עכשיו</button>
              <button className="outline-button" type="button" onClick={() => galleryInputRef.current?.click()}>בחירת תמונה</button>
            </div>
          </div>
          <aside className="provider-card">
            <p className="eyebrow">עיבוד חכם</p>
            <h2>ספק AI פעיל</h2>
            <p>הספק נקבע לפי ההגדרות בהגדרות ה־API. אם אין ספק מוגדר, הוסיפי מפתח לפני החילוץ.</p>
            <Link href="/settings/providers" className="outline-button" style={{ display: "inline-block", marginTop: 8 }}>ניהול ספקים</Link>
            <p className="privacy-note" style={{ marginTop: 16 }}>התמונה נשלחת לספק שנבחר לצורך חילוץ המתכון בלבד.</p>
          </aside>
        </section>
      )}

      {stage === "loading" && (
        <section className="import-layout">
          <div className="upload-panel" style={{ textAlign: "center" }}>
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="תמונה נבחרה" style={{ maxWidth: "100%", maxHeight: 260, borderRadius: 12, marginBottom: 16, objectFit: "contain" }} />
            )}
            <svg aria-hidden="true" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ display: "block", margin: "0 auto 10px", animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <h2>מחלץ מתכון…</h2>
            <p>העיבוד יכול לקחת עד דקה, תלוי בגודל התמונה ובאיכות הכתב.</p>
          </div>
        </section>
      )}

      {stage === "review" && recipe && (
        <section className="review-layout">
          <div className="source-preview">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="תמונת המקור" style={{ width: "100%", borderRadius: 12, objectFit: "contain", maxHeight: 320 }} />
            ) : (
              <div className="paper-preview"><span>תמונה לא זמינה</span></div>
            )}
            <p>מקור שהועלה</p>
            {recipe.raw_text && (
              <details style={{ marginTop: 14 }}>
                <summary style={{ cursor: "pointer", fontWeight: 700, color: "var(--muted)", fontSize: ".9rem" }}>
                  👁 מה שה־AI קרא בפועל
                </summary>
                <pre style={{
                  marginTop: 10, padding: 12, borderRadius: 10,
                  background: "#f4efe2", color: "#3f352b", fontSize: ".85rem",
                  fontFamily: "inherit", whiteSpace: "pre-wrap", lineHeight: 1.6,
                  maxHeight: 220, overflow: "auto",
                }}>
                  {recipe.raw_text || "(האי־איי לא זיהה טקסט)"}
                </pre>
              </details>
            )}
          </div>
          <form className="review-form" onSubmit={(e) => e.preventDefault()}>
            {(recipe.recognition_failed || (recipe.ingredients.length === 0 && recipe.steps.length === 0)) && (
              <div role="alert" style={{
                padding: 14, borderRadius: 12,
                background: "#fef3d4", border: "1.5px solid #d4a01a", color: "#5a4200",
                fontSize: ".92rem", lineHeight: 1.5,
              }}>
                <strong style={{ display: "block", marginBottom: 4 }}>⚠️ הזיהוי לא הצליח באופן מלא</strong>
                {recipe.reason || "ה־AI לא הצליח לקרוא את הטקסט בבירור. נסי שוב עם:"}
                <ul style={{ margin: "8px 0 0", paddingRight: 20 }}>
                  <li>תאורה טובה יותר (בלי צל על הדף)</li>
                  <li>הצבת המצלמה ישרה מעל הדף (לא בזווית)</li>
                  <li>תמונה חדה, בלי טשטוש</li>
                  <li>קירוב לאזור עם הטקסט</li>
                </ul>
                <button
                  type="button"
                  onClick={reset}
                  className="outline-button"
                  style={{ marginTop: 12, minHeight: 38 }}
                >
                  📷 צילום מחדש
                </button>
              </div>
            )}
            <div className="review-status">
              <span>{recipe.recognition_failed ? "זיהוי חלקי" : "טיוטה מוכנה לבדיקה"}</span>
              {recipe.provider && <small>עובד עם {recipe.provider}</small>}
            </div>
            <label>שם המתכון
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label>מרכיבים
              <textarea rows={8} value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
            </label>
            <label>שלבי הכנה
              <textarea rows={8} value={steps} onChange={(e) => setSteps(e.target.value)} />
            </label>
            {saveError && (
              <div role="alert" style={{ padding: 12, borderRadius: 12, background: "#fdecea", color: "#8a1c14", fontSize: ".9rem" }}>
                {saveError}
              </div>
            )}
            <div className="review-actions">
              <button className="outline-button" type="button" onClick={reset} disabled={saving}>בחירת תמונה אחרת</button>
              <button className="primary-button" type="button" onClick={handleSave} disabled={saving || !title.trim()}>
                {saving ? "שומר…" : "אישור ושמירה"}
              </button>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}
