"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { createRecipe } from "@/lib/actions/recipes";
import { ImageCropper } from "../../_components/image-cropper";
import { DietFieldControl, type DietOverride } from "@/components/recipes/diet-field-control";
import { IngredientPicker } from "@/components/recipes/ingredient-picker";
import { parseIngredientLine } from "@/lib/ingredients";

function appendIngredient(current: string, name: string): string {
  const trimmed = current.replace(/\s+$/, '');
  return trimmed ? `${trimmed}\n${name}` : name;
}

/**
 * Normalize an image before sending: apply EXIF orientation so vision
 * models don't have to mentally rotate the paper, cap the long edge at
 * 2400px to save bandwidth, and re-encode as JPEG.
 * Also returns a rotation control so the user can nudge orientation if
 * the auto-fix guessed wrong.
 */
async function normalizeImage(file: File, extraRotationDeg = 0): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const MAX = 2400
  let w = bitmap.width
  let h = bitmap.height
  if (Math.max(w, h) > MAX) {
    const s = MAX / Math.max(w, h)
    w = Math.round(w * s)
    h = Math.round(h * s)
  }
  const rot = ((extraRotationDeg % 360) + 360) % 360
  const swap = rot === 90 || rot === 270
  const canvas = document.createElement('canvas')
  canvas.width = swap ? h : w
  canvas.height = swap ? w : h
  const ctx = canvas.getContext('2d')!
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rot * Math.PI) / 180)
  ctx.drawImage(bitmap, -w / 2, -h / 2, w, h)
  bitmap.close?.()
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas.toBlob failed'))), 'image/jpeg', 0.92)
  })
}

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
  author?: string | null;
};

export default function PhotoImportPage() {
  const [stage, setStage] = useState<"upload" | "preview" | "loading" | "review">("upload");
  const [error, setError] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<number>(0);  // extra rotation user applied
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState<boolean>(false);
  const [recipe, setRecipe] = useState<ExtractedRecipe | null>(null);
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dietOverride, setDietOverride] = useState<DietOverride>('auto');

  const ingredientNames = useMemo(
    () => ingredients.split("\n").map((l) => l.trim()).filter(Boolean),
    [ingredients]
  );

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  async function refreshPreview(file: File, rot: number) {
    const normalized = await normalizeImage(file, rot)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(normalized))
  }

  async function handleFile(file: File) {
    setError(null);
    setRawFile(file);
    setRotation(0);
    try {
      await refreshPreview(file, 0);
      setStage("preview");
    } catch (err) {
      setError('לא ניתן לקרוא את התמונה: ' + (err instanceof Error ? err.message : String(err)));
      setStage("upload");
    }
  }

  async function handleRotate(deltaDeg: number) {
    if (!rawFile) return
    const next = ((rotation + deltaDeg) % 360 + 360) % 360
    setRotation(next)
    await refreshPreview(rawFile, next)
  }

  async function handleCropApplied(cropped: Blob) {
    // Replace rawFile with the cropped result and reset rotation
    const file = new File([cropped], "cropped.jpg", { type: "image/jpeg" })
    setRawFile(file)
    setRotation(0)
    setCropMode(false)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(cropped))
  }

  async function handleAnalyze() {
    if (!rawFile) return;
    setError(null);
    setStage("loading");
    try {
      const normalized = await normalizeImage(rawFile, rotation);
      const formData = new FormData();
      formData.append("image", new File([normalized], "recipe.jpg", { type: "image/jpeg" }));
      const res = await fetch("/api/scan", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `שגיאה ${res.status}`);
      }
      const extracted = data as ExtractedRecipe;
      setRecipe(extracted);
      // When recognition failed, blank the structured fields so the user
      // isn't tricked into saving hallucinated content
      if (extracted.recognition_failed) {
        setTitle("");
        setIngredients("");
        setSteps("");
      } else {
        setTitle(extracted.title || "");
        setIngredients((extracted.ingredients || []).join("\n"));
        setSteps((extracted.steps || []).map((s, i) => `${i + 1}. ${s}`).join("\n"));
      }
      setStage("review");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStage("preview");
    }
  }

  function reset() {
    setRawFile(null);
    setRotation(0);
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
        .map(parseIngredientLine);

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
      fd.append("isDietOverride", dietOverride);
      if (recipe?.author) fd.append("author", recipe.author);

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
            <div className="upload-actions" style={{ marginBottom: 20 }}>
              <button className="primary-button" type="button" onClick={() => cameraInputRef.current?.click()}>צילום עכשיו</button>
              <button className="outline-button" type="button" onClick={() => galleryInputRef.current?.click()}>בחירת תמונה</button>
            </div>
            {error && (
              <div role="alert" style={{ margin: "0 0 16px", padding: 12, borderRadius: 12, background: "#fdecea", color: "#8a1c14", fontSize: ".9rem" }}>
                {error}
              </div>
            )}
            <div className="camera-frame"><span>אזור צילום</span></div>
            <h2 style={{ marginTop: 16 }}>צלמי דף או כרטיסיית מתכון</h2>
            <p>התמונה תישלח לספק ה־AI המוגדר לצורך חילוץ המתכון בלבד.</p>
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

      {stage === "preview" && previewUrl && (
        <section className="import-layout">
          <div className="upload-panel" style={{ textAlign: "center" }}>
            {cropMode ? (
              <>
                <h2 style={{ marginTop: 0 }}>חיתוך התמונה</h2>
                <ImageCropper src={previewUrl} onApply={handleCropApplied} onCancel={() => setCropMode(false)} />
              </>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                  <button type="button" className="outline-button" onClick={reset}>בחירת תמונה אחרת</button>
                  <button type="button" className="primary-button" onClick={handleAnalyze}>המשך לניתוח ←</button>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  <button type="button" className="outline-button" onClick={() => handleRotate(-90)}>↺ סובבי שמאלה 90°</button>
                  <button type="button" className="outline-button" onClick={() => handleRotate(90)}>סובבי ימינה 90° ↻</button>
                  <button type="button" className="outline-button" onClick={() => handleRotate(180)}>הפכי 180°</button>
                  <button type="button" className="outline-button" onClick={() => setCropMode(true)}>✂️ חיתוך</button>
                </div>
                {error && (
                  <div role="alert" style={{ margin: "0 0 12px", padding: 12, borderRadius: 12, background: "#fdecea", color: "#8a1c14", fontSize: ".9rem" }}>
                    {error}
                  </div>
                )}
                <h2 style={{ marginTop: 0 }}>וודאי שהתמונה מיושרת</h2>
                <p style={{ marginBottom: 16 }}>הטקסט צריך להיות בכיוון הקריאה הרגיל. אם צריך, סובבי או חתכי אזור קטן יותר לזיהוי טוב יותר:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="תצוגה מקדימה" style={{ maxWidth: "100%", maxHeight: 380, borderRadius: 12, marginBottom: 16, objectFit: "contain", background: "#f4efe2" }} />
              </>
            )}
          </div>
          <aside className="provider-card">
            <p className="eyebrow">טיפים לזיהוי טוב</p>
            <ul style={{ paddingRight: 20, lineHeight: 1.8, color: "var(--muted)" }}>
              <li>שהטקסט יהיה בכיוון הקריאה הנכון</li>
              <li>תאורה טובה, בלי צל על הדף</li>
              <li>המצלמה ישרה מעל הדף (לא בזווית)</li>
              <li>הטקסט חד וממלא את המסגרת</li>
              <li>✂️ חתכי רק את אזור המתכון (בלי רקע / צלחת / מיקום מיותר)</li>
            </ul>
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
            <p>שלב 1: קורא את הטקסט מהתמונה · שלב 2: מארגן למבנה מתכון.</p>
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
              recipe.recognition_failed ? (
                <div style={{ marginTop: 14 }}>
                  <p style={{ margin: "0 0 6px", fontWeight: 800, color: "#3f352b", fontSize: ".95rem" }}>
                    📄 מה שהצלחנו לקרוא מהתמונה:
                  </p>
                  <pre style={{
                    margin: 0, padding: 14, borderRadius: 10,
                    background: "#fffcf5", color: "#241a10",
                    fontSize: "1rem", fontFamily: "inherit",
                    whiteSpace: "pre-wrap", lineHeight: 1.75,
                    border: "1.5px dashed #d4a01a",
                    maxHeight: 400, overflow: "auto",
                  }}>
                    {recipe.raw_text}
                  </pre>
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="outline-button"
                      style={{ minHeight: 38, flex: 1 }}
                      onClick={() => {
                        if (recipe.raw_text) setIngredients(recipe.raw_text);
                      }}
                    >
                      ⤵ העתיקי לשדה המרכיבים
                    </button>
                    <button
                      type="button"
                      className="outline-button"
                      style={{ minHeight: 38, flex: 1 }}
                      onClick={() => {
                        if (recipe.raw_text) navigator.clipboard?.writeText(recipe.raw_text);
                      }}
                    >
                      📋 העתיקי ללוח
                    </button>
                  </div>
                </div>
              ) : (
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
                    {recipe.raw_text}
                  </pre>
                </details>
              )
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
            <IngredientPicker onPick={(name) => setIngredients((v) => appendIngredient(v, name))} />
            <label>שלבי הכנה
              <textarea rows={8} value={steps} onChange={(e) => setSteps(e.target.value)} />
            </label>
            <DietFieldControl
              title={title}
              ingredientNames={ingredientNames}
              override={dietOverride}
              onOverrideChange={setDietOverride}
            />
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
