'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import '../preview.css'
import './scan.css'

type ExtractedRecipe = {
  title: string
  description?: string | null
  servings?: number | null
  prep_minutes?: number | null
  cook_minutes?: number | null
  ingredients: string[]
  steps: string[]
  provider?: string
}

type Phase = 'idle' | 'camera' | 'processing' | 'result' | 'error'

export default function ScanPreviewPage() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [recipe, setRecipe] = useState<ExtractedRecipe | null>(null)
  const [progress, setProgress] = useState<string>('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  async function startCamera() {
    setErrorMsg(null)
    setPhase('camera')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (err) {
      console.error('camera error', err)
      setErrorMsg('לא הצלחתי לגשת למצלמה. אפשרי להשתמש בהעלאת קובץ במקום.')
      setPhase('idle')
    }
  }

  async function capture() {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const width = video.videoWidth
    const height = video.videoHeight
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, width, height)

    canvas.toBlob(
      async (blob) => {
        if (!blob) return
        stopCamera()
        const url = URL.createObjectURL(blob)
        setImageUrl(url)
        await sendToScanApi(blob, `capture-${Date.now()}.jpg`)
      },
      'image/jpeg',
      0.9
    )
  }

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    await sendToScanApi(file, file.name)
  }

  async function sendToScanApi(fileOrBlob: Blob, filename: string) {
    setPhase('processing')
    setProgress('שולח את התמונה לחילוץ...')
    setErrorMsg(null)
    setRecipe(null)

    try {
      const formData = new FormData()
      formData.append('image', fileOrBlob, filename)

      const response = await fetch('/api/scan', { method: 'POST', body: formData })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `שגיאה ${response.status}`)
      }

      setRecipe(data)
      setPhase('result')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'שגיאה לא ידועה')
      setPhase('error')
    }
  }

  function reset() {
    stopCamera()
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(null)
    setRecipe(null)
    setErrorMsg(null)
    setPhase('idle')
  }

  return (
    <div className="scan-page">
      <header className="scan-header">
        <Link href="/preview/add" className="scan-back" aria-label="חזרה">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>
        <h1>צילום מתכון</h1>
        <div className="scan-header-spacer" aria-hidden="true"></div>
      </header>

      {/* ===== IDLE — Choice of Camera / Upload ===== */}
      {phase === 'idle' && (
        <div className="scan-idle">
          <div className="scan-hero">
            <div className="scan-hero-icon" aria-hidden="true">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <h2>צלם או העלה תמונה של מתכון</h2>
            <p>המערכת תזהה אוטומטית את הכותרת, המרכיבים והשלבים.</p>
          </div>

          {errorMsg && <p className="scan-error-inline">{errorMsg}</p>}

          <div className="scan-actions">
            <button type="button" className="scan-cta primary" onClick={startCamera}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              פתח מצלמה
            </button>

            <button type="button" className="scan-cta secondary" onClick={() => fileInputRef.current?.click()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              בחירה מהגלריה
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFileChosen}
            hidden
          />

          <p className="scan-tip">
            💡 טיפ: הצילום ייתן תוצאה טובה יותר כשהתאורה טובה והדף שטוח מול המצלמה.
          </p>
        </div>
      )}

      {/* ===== CAMERA — Live view ===== */}
      {phase === 'camera' && (
        <div className="scan-camera">
          <video ref={videoRef} className="scan-video" playsInline muted />
          <div className="scan-camera-actions">
            <button type="button" className="scan-cancel" onClick={reset}>ביטול</button>
            <button type="button" className="scan-shutter" onClick={capture} aria-label="צילום">
              <span className="scan-shutter-inner"/>
            </button>
            <div style={{ width: 60 }} aria-hidden="true"/>
          </div>
        </div>
      )}

      {/* ===== PROCESSING ===== */}
      {phase === 'processing' && (
        <div className="scan-processing">
          {imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={imageUrl} alt="" className="scan-thumb" />
          )}
          <div className="scan-spinner" aria-hidden="true"/>
          <h3>מעבד את התמונה...</h3>
          <p>{progress || 'החילוץ עשוי לקחת עד 30 שניות'}</p>
        </div>
      )}

      {/* ===== RESULT ===== */}
      {phase === 'result' && recipe && (
        <div className="scan-result">
          {imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={imageUrl} alt="" className="scan-result-photo" />
          )}

          <div className="scan-result-body">
            <div className="scan-result-title">
              <h2>{recipe.title}</h2>
              {recipe.provider && <span className="scan-provider">חולץ ע״י {recipe.provider}</span>}
            </div>

            {recipe.description && <p className="scan-result-desc">{recipe.description}</p>}

            <div className="scan-result-meta">
              {recipe.servings != null && <span>👥 {recipe.servings} מנות</span>}
              {recipe.prep_minutes != null && <span>🕒 הכנה {recipe.prep_minutes} דק׳</span>}
              {recipe.cook_minutes != null && <span>🔥 בישול {recipe.cook_minutes} דק׳</span>}
            </div>

            <section className="scan-section" aria-label="מרכיבים">
              <h3>מרכיבים ({recipe.ingredients.length})</h3>
              {recipe.ingredients.length > 0 ? (
                <ul>
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              ) : (
                <p className="scan-empty">לא זוהו מרכיבים</p>
              )}
            </section>

            <section className="scan-section" aria-label="הוראות הכנה">
              <h3>הוראות הכנה ({recipe.steps.length})</h3>
              {recipe.steps.length > 0 ? (
                <ol>
                  {recipe.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              ) : (
                <p className="scan-empty">לא זוהו שלבים</p>
              )}
            </section>

            <div className="scan-result-actions">
              <button type="button" className="scan-cta secondary" onClick={reset}>סרוק שוב</button>
              <button type="button" className="scan-cta primary">שמור את המתכון</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ERROR ===== */}
      {phase === 'error' && (
        <div className="scan-error">
          <div className="scan-error-icon">✕</div>
          <h3>לא הצלחנו לחלץ את המתכון</h3>
          <p>{errorMsg}</p>
          <button type="button" className="scan-cta primary" onClick={reset}>נסיון נוסף</button>
        </div>
      )}

      <canvas ref={canvasRef} hidden aria-hidden="true"/>
    </div>
  )
}
