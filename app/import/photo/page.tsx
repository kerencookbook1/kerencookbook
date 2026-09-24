"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createRecipe } from "@/lib/actions/recipes";
import { ImageCropper } from "../../_components/image-cropper";
import { DietFieldControl, type DietOverride } from "@/components/recipes/diet-field-control";
import { IngredientPicker } from "@/components/recipes/ingredient-picker";
import { parseIngredientLine } from "@/lib/ingredients";
import { createClient } from "@/lib/supabase/client";
import { RECIPE_IMAGES_BUCKET } from "@/lib/recipe-image-url";

function appendIngredient(current: string, name: string): string {
  const trimmed = current.replace(/\s+$/, '');
  return trimmed ? `${trimmed}\n${name}` : name;
}

/**
 * Normalize an image before sending: apply EXIF orientation so vision
 * models don't have to mentally rotate the paper, cap the long edge at
 * 2400px to save bandwidth, and re-encode as JPEG.
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
  ingredientGroups?: Array<{ title: string | null; items: string[] }>;
  steps: Array<{ title: string | null; body: string }>;
  provider?: string;
  raw_text?: string | null;
  recognition_failed?: boolean;
  reason?: string | null;
  author?: string | null;
};

/** One scanned page of a multi-page recipe. */
type Page = {
  id: string;
  file: File;
  rotation: number;
  previewUrl: string;
};

const MAX_PAGES = 3;

export default function PhotoImportPage() {
  const [stage, setStage] = useState<"upload" | "preview" | "loading" | "review">("upload");
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [cropActive, setCropActive] = useState<boolean>(false);
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

  // Clean up object URLs when the component unmounts / pages change
  useEffect(() => {
    return () => {
      for (const p of pages) URL.revokeObjectURL(p.previewUrl);
    };
    // We only want the cleanup on unmount — not every page change (each
    // handler revokes the URL it replaces individually).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activePage = pages[activeIdx];
  const canAddMore = pages.length < MAX_PAGES;

  async function makePreviewUrl(file: File, rotation: number): Promise<string> {
    const normalized = await normalizeImage(file, rotation);
    return URL.createObjectURL(normalized);
  }

  /** Append a new page (or, when we already have MAX_PAGES, ignore + surface an error). */
  async function handleAddPage(file: File) {
    setError(null);
    if (pages.length >= MAX_PAGES) {
      setError(`אפשר לצלם עד ${MAX_PAGES} דפים בסריקה אחת. מחקי דף קיים כדי להוסיף חדש.`);
      return;
    }
    try {
      const previewUrl = await makePreviewUrl(file, 0);
      const next: Page = { id: crypto.randomUUID(), file, rotation: 0, previewUrl };
      setPages((prev) => {
        const updated = [...prev, next];
        setActiveIdx(updated.length - 1);
        return updated;
      });
      setStage("preview");
    } catch (err) {
      setError('לא ניתן לקרוא את התמונה: ' + (err instanceof Error ? err.message : String(err)));
      if (pages.length === 0) setStage("upload");
    }
  }

  async function handleRotate(deltaDeg: number) {
    if (!activePage) return;
    const nextRot = ((activePage.rotation + deltaDeg) % 360 + 360) % 360;
    const nextUrl = await makePreviewUrl(activePage.file, nextRot);
    setPages((prev) => {
      const copy = [...prev];
      const old = copy[activeIdx];
      if (!old) return prev;
      URL.revokeObjectURL(old.previewUrl);
      copy[activeIdx] = { ...old, rotation: nextRot, previewUrl: nextUrl };
      return copy;
    });
  }

  async function handleCropApplied(cropped: Blob) {
    if (!activePage) return;
    const file = new File([cropped], "cropped.jpg", { type: "image/jpeg" });
    const nextUrl = URL.createObjectURL(cropped);
    setPages((prev) => {
      const copy = [...prev];
      const old = copy[activeIdx];
      if (!old) return prev;
      URL.revokeObjectURL(old.previewUrl);
      copy[activeIdx] = { ...old, file, rotation: 0, previewUrl: nextUrl };
      return copy;
    });
    setCropActive(false);
  }

  function handleRemovePage(idx: number) {
    setPages((prev) => {
      const removed = prev[idx];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      const next = prev.filter((_, i) => i !== idx);
      // Adjust active index so it stays valid
      setActiveIdx((cur) => {
        if (next.length === 0) return 0;
        if (cur >= next.length) return next.length - 1;
        if (cur > idx) return cur - 1;
        return cur;
      });
      if (next.length === 0) {
        setStage("upload");
      }
      return next;
    });
  }

  async function handleAnalyze() {
    if (pages.length === 0) return;
    setError(null);
    setStage("loading");
    try {
      const formData = new FormData();
      // Normalize each page (rotate + resize + re-encode) so the server
      // receives clean, oriented JPEGs. Uses per-page rotation state.
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i]!;
        const normalized = await normalizeImage(p.file, p.rotation);
        formData.append(`image${i + 1}`, new File([normalized], `page${i + 1}.jpg`, { type: "image/jpeg" }));
      }
      const res = await fetch("/api/scan", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `שגיאה ${res.status}`);
      const extracted = data as ExtractedRecipe;
      setRecipe(extracted);
      if (extracted.recognition_failed) {
        setTitle("");
        setIngredients("");
        setSteps("");
      } else {
        setTitle(extracted.title || "");
        // Format ingredients with group headers when groups exist
        const groups = extracted.ingredientGroups;
        if (groups && groups.length > 1) {
          setIngredients(groups.map((g) => {
            const header = g.title ? `=== ${g.title} ===` : '';
            return [header, ...g.items].filter(Boolean).join('\n');
          }).join('\n'));
        } else {
          setIngredients((extracted.ingredients || []).join("\n"));
        }
        // Steps: use body field (new format)
        setSteps((extracted.steps || []).map((s, i) => {
          const prefix = s.title ? `[${s.title}] ` : '';
          return `${i + 1}. ${prefix}${s.body}`;
        }).join("\n"));
      }
      setStage("review");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStage("preview");
    }
  }

  function reset() {
    for (const p of pages) URL.revokeObjectURL(p.previewUrl);
    setPages([]);
    setActiveIdx(0);
    setCropActive(false);
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

      // Upload the first page as the source photo (it's the "cover" of the
      // scanned document). Additional pages aren't persisted individually —
      // if the user wants more images on the recipe, they can add them via
      // the recipe images editor after save.
      let sourcePhotoPath: string | null = null;
      if (pages[0]) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const normalizedBlob = await normalizeImage(pages[0].file, pages[0].rotation);
            const objectName = `${user.id}/imports/${crypto.randomUUID()}.jpg`;
            const upload = await supabase.storage
              .from(RECIPE_IMAGES_BUCKET)
              .upload(objectName, normalizedBlob, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'image/jpeg',
              });
            if (!upload.error) sourcePhotoPath = objectName;
          }
        } catch {
          // Non-fatal — save the recipe even if the photo upload didn't work.
        }
      }

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
      if (sourcePhotoPath) {
        fd.append("sourcePhotoPath", sourcePhotoPath);
        fd.append("imageUrl", sourcePhotoPath);
      }

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
        <p>אפשר לצלם עד {MAX_PAGES} דפים באותה סריקה — לפעמים המתכון פרוס על כמה עמודים. ה־AI יוצר טיוטה בלבד. תמיד אפשר לתקן לפני השמירה.</p>
      </header>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAddPage(f); e.target.value = ""; }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAddPage(f); e.target.value = ""; }}
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
            <p>אחרי הצילום הראשון תוכלי להוסיף עוד עד {MAX_PAGES - 1} דפים לפני חילוץ. התמונות נשלחות לספק ה־AI המוגדר לצורך חילוץ המתכון בלבד.</p>
          </div>
          <aside className="provider-card">
            <p className="eyebrow">עיבוד חכם</p>
            <h2>ספק AI פעיל</h2>
            <p>הספק נקבע לפי ההגדרות בהגדרות ה־API. אם אין ספק מוגדר, הוסיפי מפתח לפני החילוץ.</p>
            <Link href="/settings/providers" className="outline-button" style={{ display: "inline-block", marginTop: 8 }}>ניהול ספקים</Link>
            <p className="privacy-note" style={{ marginTop: 16 }}>התמונות נשלחות לספק שנבחר לצורך חילוץ המתכון בלבד.</p>
          </aside>
        </section>
      )}

      {stage === "preview" && activePage && (
        <section className="import-layout">
          <div className="upload-panel" style={{ textAlign: "center" }}>
            {cropActive ? (
              <>
                <h2 style={{ marginTop: 0 }}>חיתוך התמונה — דף {activeIdx + 1}</h2>
                <ImageCropper src={activePage.previewUrl} onApply={handleCropApplied} onCancel={() => setCropActive(false)} />
              </>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                  <button type="button" className="outline-button" onClick={reset}>התחילי מחדש</button>
                  <button type="button" className="primary-button" onClick={handleAnalyze}>
                    המשך לניתוח ({pages.length} {pages.length === 1 ? "דף" : "דפים"}) ←
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  <button type="button" className="outline-button" onClick={() => handleRotate(-90)}>↺ סובבי שמאלה 90°</button>
                  <button type="button" className="outline-button" onClick={() => handleRotate(90)}>סובבי ימינה 90° ↻</button>
                  <button type="button" className="outline-button" onClick={() => handleRotate(180)}>הפכי 180°</button>
                  <button type="button" className="outline-button" onClick={() => setCropActive(true)}>✂️ חיתוך</button>
                </div>
                {error && (
                  <div role="alert" style={{ margin: "0 0 12px", padding: 12, borderRadius: 12, background: "#fdecea", color: "#8a1c14", fontSize: ".9rem" }}>
                    {error}
                  </div>
                )}

                {/* Page thumbnails row + add-page tile */}
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }} role="tablist" aria-label="דפים בסריקה">
                  {pages.map((p, idx) => {
                    const isActive = idx === activeIdx;
                    return (
                      <div
                        key={p.id}
                        style={{ position: "relative", width: 84, height: 84 }}
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setActiveIdx(idx)}
                          style={{
                            width: "100%",
                            height: "100%",
                            padding: 0,
                            borderRadius: 10,
                            background: "#f4efe2",
                            border: isActive ? "2.5px solid #4d7c0f" : "1.5px solid #cfbfae",
                            cursor: "pointer",
                            overflow: "hidden",
                            boxShadow: isActive ? "0 2px 8px rgba(77,124,15,.25)" : "0 1px 3px rgba(0,0,0,.08)",
                          }}
                          aria-label={`דף ${idx + 1}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.previewUrl}
                            alt={`דף ${idx + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        </button>
                        <span
                          style={{
                            position: "absolute",
                            top: 3,
                            insetInlineEnd: 3,
                            background: isActive ? "#4d7c0f" : "#1a1614",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: 999,
                          }}
                          aria-hidden
                        >
                          {idx + 1}
                        </span>
                        {pages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePage(idx)}
                            aria-label={`מחיקת דף ${idx + 1}`}
                            style={{
                              position: "absolute",
                              top: -6,
                              insetInlineStart: -6,
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              background: "#c62828",
                              color: "#fff",
                              border: "2px solid #fff",
                              cursor: "pointer",
                              fontSize: 11,
                              fontWeight: 900,
                              lineHeight: 1,
                              boxShadow: "0 1px 3px rgba(0,0,0,.3)",
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {canAddMore && (
                    <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        aria-label="הוספת דף מהמצלמה"
                        style={{
                          width: 84,
                          height: 84,
                          borderRadius: 10,
                          background: "#EAF1E3",
                          border: "2px dashed #4d7c0f",
                          color: "#3f6212",
                          fontWeight: 800,
                          fontSize: 12,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                        }}
                      >
                        <span style={{ fontSize: 22 }} aria-hidden>+</span>
                        <span>הוסיפי דף</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        style={{
                          background: "transparent",
                          border: 0,
                          color: "var(--muted)",
                          fontSize: 11,
                          cursor: "pointer",
                          padding: "2px 0",
                        }}
                      >
                        או מהגלריה
                      </button>
                    </div>
                  )}
                </div>

                <h2 style={{ marginTop: 0 }}>
                  דף {activeIdx + 1} מתוך {pages.length}
                </h2>
                <p style={{ marginBottom: 16 }}>
                  הטקסט צריך להיות בכיוון הקריאה הרגיל. אפשר לסובב או לחתוך אזור לזיהוי טוב יותר.
                  {canAddMore && ` יש עוד ${MAX_PAGES - pages.length} מקומות לדפים נוספים.`}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activePage.previewUrl} alt={`דף ${activeIdx + 1}`} style={{ maxWidth: "100%", maxHeight: 380, borderRadius: 12, marginBottom: 16, objectFit: "contain", background: "#f4efe2" }} />
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
              <li>לצילום ה-2 וה-3: אותה תאורה, אותו זווית — עוזר ל־AI להבין שזה המשך של אותו מתכון</li>
            </ul>
          </aside>
        </section>
      )}

      {stage === "loading" && (
        <section className="import-layout">
          <div className="upload-panel" style={{ textAlign: "center" }}>
            {activePage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activePage.previewUrl} alt="תמונה נבחרה" style={{ maxWidth: "100%", maxHeight: 260, borderRadius: 12, marginBottom: 16, objectFit: "contain" }} />
            )}
            <svg aria-hidden="true" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ display: "block", margin: "0 auto 10px", animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <h2>מחלץ מתכון מ־{pages.length} {pages.length === 1 ? "דף" : "דפים"}…</h2>
            <p>שלב 1: קורא את הטקסט מכל דף · שלב 2: מארגן למבנה מתכון אחד.</p>
          </div>
        </section>
      )}

      {stage === "review" && recipe && (
        <section className="review-layout">
          <div className="source-preview">
            {activePage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activePage.previewUrl} alt="תמונת המקור" style={{ width: "100%", borderRadius: 12, objectFit: "contain", maxHeight: 320 }} />
            ) : (
              <div className="paper-preview"><span>תמונה לא זמינה</span></div>
            )}
            {pages.length > 1 && (
              <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {pages.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    aria-label={`דף ${idx + 1}`}
                    style={{
                      width: 52,
                      height: 52,
                      padding: 0,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#f4efe2",
                      border: idx === activeIdx ? "2px solid #4d7c0f" : "1.5px solid #cfbfae",
                      cursor: "pointer",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}
            <p>{pages.length > 1 ? `מקור: ${pages.length} דפים` : "מקור שהועלה"}</p>
            {recipe.raw_text && (
              recipe.recognition_failed ? (
                <div style={{ marginTop: 14 }}>
                  <p style={{ margin: "0 0 6px", fontWeight: 800, color: "#3f352b", fontSize: ".95rem" }}>
                    📄 מה שהצלחנו לקרוא מהתמונות:
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
