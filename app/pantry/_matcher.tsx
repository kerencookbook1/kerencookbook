'use client'

import Link from 'next/link'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Camera, ChefHat, Clock3, ImagePlus, Mic, MicOff, Play, Search, Send, Sparkles, Volume2, VolumeX, X } from 'lucide-react'
import { RecipeImagePlaceholder } from '@/components/recipes/recipe-image-placeholder'
import { saveGeneratedRecipe } from '@/lib/actions/recipes'

type Recipe = {
  id: string
  title: string
  category: string | null
  image_url: string | null
  ingredientNames: string[]
  prep_time: number | null
  cook_time: number | null
}

type ChatMessage = {
  id: number
  role: 'assistant' | 'user'
  text: string
}

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

type Result = {
  recipe: Recipe
  matched: number
  missing: number
  percent: number
  missingList: string[]
}

type GeneratedMeal = {
  meal: string
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  missingIngredients: string[]
}

/** Quick-add chips for common Israeli pantry staples — one click adds to input. */
const QUICK_ITEMS: Array<{ label: string; emoji: string }> = [
  { label: 'ביצים',      emoji: '🥚' },
  { label: 'בצל',        emoji: '🧅' },
  { label: 'עגבניות',    emoji: '🍅' },
  { label: 'שום',        emoji: '🧄' },
  { label: 'שמן זית',    emoji: '🫒' },
  { label: 'קמח',        emoji: '🌾' },
  { label: 'סוכר',       emoji: '🍯' },
  { label: 'חמאה',       emoji: '🧈' },
  { label: 'חלב',        emoji: '🥛' },
  { label: 'גבינה צהובה', emoji: '🧀' },
  { label: 'לימון',      emoji: '🍋' },
  { label: 'פלפל',       emoji: '🌶️' },
  { label: 'מלח',        emoji: '🧂' },
  { label: 'אורז',       emoji: '🍚' },
  { label: 'פסטה',       emoji: '🍝' },
  { label: 'תפוח אדמה',  emoji: '🥔' },
  { label: 'גזר',        emoji: '🥕' },
]

// Normalize an ingredient/pantry item so "2 ביצים גדולות" and "ביצה" both match.
function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,;:()\/\d]/g, ' ')
    // Remove common Hebrew/English measurement + prep words
    .replace(/\b(כפית|כפות|כפ|כוס|כוסות|גרם|ק"ג|קילו|מ"ל|מל|ליטר|כפיות|קורט|חצי|רבע|שליש|קצוץ|קצוצה|קצוצים|טחון|טחונה|טחונים|קלוף|קלופה|גדול|גדולה|גדולים|קטן|קטנה|לפי הטעם|של|טרי|טרייה|טריים)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length >= 2)
}

/** How many pantry tokens appear in the recipe's ingredient words. */
function scoreMatch(ingredientWords: Set<string>, pantryWords: Set<string>): { matched: number; missing: number; matchedList: string[]; missingList: string[] } {
  const matched: string[] = []
  const missing: string[] = []
  for (const w of ingredientWords) {
    if (pantryWords.has(w) || Array.from(pantryWords).some((p) => w.includes(p) || p.includes(w))) {
      matched.push(w)
    } else {
      missing.push(w)
    }
  }
  return { matched: matched.length, missing: missing.length, matchedList: matched, missingList: missing }
}

export function PantryMatcher({ recipes }: { recipes: Recipe[] }) {
  const [input, setInput] = useState('')
  const [strict, setStrict] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [aiMenu, setAiMenu] = useState<GeneratedMeal[] | null>(null)
  const [isBuildingMenu, setIsBuildingMenu] = useState(false)
  const [isChatting, setIsChatting] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [savedMeals, setSavedMeals] = useState<Record<string, string>>({})
  const [savingMeal, setSavingMeal] = useState<string | null>(null)
  const [scanFiles, setScanFiles] = useState<File[]>([])
  const [scanPreviews, setScanPreviews] = useState<string[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  function addQuickItem(label: string) {
    setInput((current) => {
      const lines = current.split('\n').map((l) => l.trim())
      if (lines.some((l) => l.toLowerCase() === label.toLowerCase())) return current
      const trimmed = current.replace(/\s+$/, '')
      return trimmed ? `${trimmed}\n${label}` : label
    })
  }

  const pantryWords = useMemo(() => {
    const words = new Set<string>()
    for (const line of input.split(/[\n,]/)) {
      for (const w of normalize(line)) words.add(w)
    }
    return words
  }, [input])

  const results = useMemo<Result[]>(() => {
    if (pantryWords.size === 0) return []
    return recipes
      .map((r) => {
        const ingWords = new Set<string>()
        for (const name of r.ingredientNames) {
          for (const w of normalize(name)) ingWords.add(w)
        }
        const { matched, missing, matchedList, missingList } = scoreMatch(ingWords, pantryWords)
        const total = matched + missing
        const percent = total === 0 ? 0 : Math.round((matched / total) * 100)
        return { recipe: r, matched, missing, percent, matchedList, missingList }
      })
      .filter((r) => (strict ? r.missing === 0 : r.percent >= 40))
      .sort((a, b) => b.percent - a.percent || b.matched - a.matched)
      .slice(0, 20)
  }, [recipes, pantryWords, strict])

  const menu = useMemo(() => {
    const slots = [
      { label: 'ארוחת בוקר', hint: 'משהו קל לפתוח איתו את היום' },
      { label: 'ארוחת צהריים', hint: 'מנה משביעה עם מה שכבר יש בבית' },
      { label: 'ארוחת ערב', hint: 'ארוחה נעימה בלי קפיצה גדולה לקניות' },
    ]
    return slots.map((slot, index) => ({ ...slot, result: results[index] ?? null }))
  }, [results])

  const firstRecipe = results[0]?.recipe.title
  const assistantIntro = pantryWords.size === 0
    ? 'הוסיפי כמה מוצרים שיש לך, ואני אבנה לך רעיונות ותפריט שמתאים למה שכבר במטבח.'
    : firstRecipe
      ? `מצאתי ${results.length} התאמות. רוצה שאחפש לך מתכון מתוך ${firstRecipe} או אבנה תפריט לכל היום?`
      : 'עדיין לא מצאתי התאמה מדויקת, אבל אפשר לבנות יחד רעיון ולציין מה חסר לקנייה.'

  const visibleMessages = messages.length > 0
    ? messages.map((message, index) => index === 0 && message.role === 'assistant' ? { ...message, text: assistantIntro } : message)
    : [{ id: 1, role: 'assistant' as const, text: assistantIntro }]

  async function buildMenu() {
    if (pantryWords.size === 0 || isBuildingMenu) return
    setMenuOpen(true)
    setIsBuildingMenu(true)
    setAiError(null)
    setMessages((current) => [...current, {
      id: Date.now(),
      role: 'assistant',
      text: 'אני בודקת את המוצרים שלך ומרכיבה תפריט אישי…',
    }])
    try {
      const response = await fetch('/api/ai/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: input.split(/[\n,]/).map((item) => item.trim()).filter(Boolean),
          recipes: results.map(({ recipe, percent, missingList }) => ({ title: recipe.title, matchPercent: percent, missing: missingList.slice(0, 6) })),
          conversation: messages.slice(-8).map(({ role, text }) => ({ role, text })),
        }),
      })
      const data = await response.json() as { message?: string; meals?: GeneratedMeal[]; error?: string }
      if (!response.ok || !Array.isArray(data.meals)) throw new Error(data.error ?? 'לא התקבל תפריט תקין')
      setAiMenu(data.meals)
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: data.message ?? 'הרכבתי לך תפריט לפי המוצרים שיש בבית.' }])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'לא הצלחתי לבנות את התפריט'
      setAiError(message)
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: `לא הצלחתי לבנות כרגע תפריט דרך ה‑AI. ${message}` }])
    } finally {
      setIsBuildingMenu(false)
    }
  }

  function handleScanFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []).slice(0, 10 - scanFiles.length)
    if (selected.length === 0) return
    setScanFiles((current) => [...current, ...selected])
    setScanPreviews((current) => [...current, ...selected.map((file) => URL.createObjectURL(file))])
    event.target.value = ''
  }

  function removeScanFile(index: number) {
    URL.revokeObjectURL(scanPreviews[index] ?? '')
    setScanFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setScanPreviews((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  async function compressImage(file: File): Promise<string> {
    const source = await createImageBitmap(file)
    const scale = Math.min(1, 1280 / Math.max(source.width, source.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(source.width * scale))
    canvas.height = Math.max(1, Math.round(source.height * scale))
    canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height)
    source.close()
    return canvas.toDataURL('image/jpeg', 0.78)
  }

  async function scanPantryPhotos() {
    if (scanFiles.length === 0 || isScanning) return
    setIsScanning(true)
    setScanError(null)
    try {
      const images = await Promise.all(scanFiles.map(async (file) => ({ data: await compressImage(file), mimeType: 'image/jpeg' as const })))
      const response = await fetch('/api/ai/pantry/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      })
      const data = await response.json() as { items?: string[]; error?: string }
      if (!response.ok || !data.items) throw new Error(data.error ?? 'לא הצלחתי לזהות את המוצרים')
      setInput((current) => {
        const existing = current.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)
        const merged = [...existing, ...data.items!].filter((item, index, all) => all.findIndex((other) => other.toLowerCase() === item.toLowerCase()) === index)
        return merged.join('\n')
      })
      setMessages((current) => [...current, { id: Date.now(), role: 'assistant', text: data.items!.length > 0 ? `זיהיתי ${data.items!.length} מוצרים. הוספתי אותם לרשימה — בדקי ותיקני לפני בניית התפריט.` : 'לא זיהיתי מוצרים בביטחון. נסי לצלם מקרוב יותר ובתאורה טובה.' }])
      setScanFiles([])
      scanPreviews.forEach((preview) => URL.revokeObjectURL(preview))
      setScanPreviews([])
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'לא הצלחתי לנתח את התמונות')
    } finally {
      setIsScanning(false)
    }
  }

  async function answer(text: string) {
    const normalized = text.trim()
    if (!normalized || isChatting) return
    const wantsRecipe = /מתכון|לחפש|חיפוש|מה להכין|להכין/.test(normalized)
    const wantsMenu = /תפריט|יום|ארוחות/.test(normalized)
    const fallback = wantsMenu
      ? 'בשמחה — פתחתי לך תפריט יומי למטה. כל מנה מבוססת קודם כל על המוצרים שסימנת.'
      : wantsRecipe && firstRecipe
        ? `מצאתי לך את ${firstRecipe}. פתחי את הכרטיס כדי לראות את המתכון המלא, או שאלי אותי על החלפות ושלבי ההכנה.`
        : pantryWords.size > 0
          ? `לפי מה שיש לך, הייתי מתחילה עם ${firstRecipe ?? 'רעיון פשוט מהמרכיבים הזמינים'}. רוצה שאבנה גרסה מהירה או צמחונית?`
          : 'אני צריכה עוד כמה מוצרים כדי להציע רעיון מדויק. נסי להוסיף ביצים, ירקות, אורז או פסטה.'
    setChatInput('')
    setMessages((current) => [...current, { id: Date.now(), role: 'user', text: normalized }])
    if (wantsMenu) setMenuOpen(true)
    if (pantryWords.size === 0) {
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: fallback }])
      return
    }
    setIsChatting(true)
    try {
      const response = await fetch('/api/ai/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          message: normalized,
          ingredients: input.split(/[\n,]/).map((item) => item.trim()).filter(Boolean),
          recipes: results.map(({ recipe, percent, missingList }) => ({ title: recipe.title, matchPercent: percent, missing: missingList.slice(0, 6) })),
          conversation: messages.slice(-8).map(({ role, text }) => ({ role, text })),
        }),
      })
      const data = await response.json() as { reply?: string; error?: string }
      if (!response.ok || !data.reply) throw new Error(data.error ?? 'לא התקבלה תשובה')
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: data.reply! }])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'לא הצלחתי להתחבר ל‑AI'
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: `לא הצלחתי לקבל תשובה מה‑AI. ${message}` }])
    } finally {
      setIsChatting(false)
    }
  }

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const SpeechRecognition = (window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition
      ?? (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMessages((current) => [...current, { id: Date.now(), role: 'assistant', text: 'הדפדפן הזה לא תומך בקלט קולי. אפשר להקליד כאן, או לנסות Chrome / Safari בגרסה עדכנית.' }])
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'he-IL'
    recognition.interimResults = false
    recognition.continuous = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      setChatInput(transcript)
      void answer(transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    setIsListening(true)
    recognition.start()
  }

  function speak(text: string) {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    if (isSpeaking) {
      setIsSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'he-IL'
    utterance.onend = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  async function saveMeal(meal: GeneratedMeal) {
    const key = `${meal.meal}-${meal.title}`
    if (savingMeal || savedMeals[key]) return
    setSavingMeal(key)
    const result = await saveGeneratedRecipe({
      title: meal.title,
      description: meal.description,
      ingredients: meal.ingredients,
      steps: meal.steps,
    })
    if (result.ok && result.id) setSavedMeals((current) => ({ ...current, [key]: result.id! }))
    else setAiError(result.error ?? 'לא הצלחתי לשמור את המתכון')
    setSavingMeal(null)
  }

  return (
    <div className="pantry-workspace">
      <div className="upload-panel" style={{ padding: 20 }}>
        <label htmlFor="pantry-input" style={{ display: 'block', fontWeight: 800, marginBottom: 8 }}>
          המרכיבים שיש לך (שורה או פסיק בין אחד לשני)
        </label>
        <textarea
          id="pantry-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"ביצים\nגבינה צהובה\nעגבניות\nבצל\nשום\nשמן זית"}
          rows={8}
          style={{
            width: '100%',
            border: '1px solid #cfbfae',
            borderRadius: 12,
            padding: '12px 14px',
            background: '#fffdfa',
            fontSize: '1rem',
            fontFamily: 'inherit',
            lineHeight: 1.6,
            resize: 'vertical',
          }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontWeight: 700, cursor: 'pointer' }}>
          <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} style={{ width: 18, height: 18 }} />
          הצג רק מתכונים שיש לי את <em>כל</em> המרכיבים
        </label>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--muted, #525252)', marginBottom: 8 }}>
            הוספה מהירה
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {QUICK_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => addQuickItem(item.label)}
                className="outline-button"
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  fontSize: '.85rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  minHeight: 34,
                }}
              >
                <span aria-hidden>{item.emoji}</span> {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="pantry-photo-scan">
          <div className="pantry-photo-scan-copy"><Camera size={20} aria-hidden="true" /><div><strong>אפשר גם לצלם את המקרר</strong><span>עד 10 תמונות — ה‑AI יזהה את המוצרים ויוסיף אותם לרשימה.</span></div></div>
          <div className="pantry-photo-picker-row">
            <label className="pantry-photo-picker"><Camera size={18} /> צלמי עכשיו<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleScanFiles} disabled={scanFiles.length >= 10} /></label>
            <label className="pantry-photo-picker"><ImagePlus size={18} /> הוסיפי מהגלריה<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleScanFiles} disabled={scanFiles.length >= 10} /></label>
          </div>
          {scanPreviews.length > 0 && <div className="pantry-photo-previews">{scanPreviews.map((preview, index) => <div className="pantry-photo-preview" key={preview}><img src={preview} alt={`תמונה ${index + 1}`} /><button type="button" onClick={() => removeScanFile(index)} aria-label={`הסירי תמונה ${index + 1}`}><X size={15} /></button></div>)}</div>}
          {scanFiles.length > 0 && <button type="button" className="primary-button pantry-scan-button" onClick={() => { void scanPantryPhotos() }} disabled={isScanning}><Camera size={18} /> {isScanning ? 'מזהה מוצרים…' : `זהי מוצרים מ־${scanFiles.length} ${scanFiles.length === 1 ? 'תמונה' : 'תמונות'}`}</button>}
          {scanError && <p className="pantry-ai-error" role="alert">{scanError}</p>}
        </div>
      </div>

      <section className="pantry-assistant" aria-labelledby="pantry-assistant-title">
        <div className="pantry-assistant-header">
          <div className="pantry-assistant-avatar" aria-hidden="true"><Sparkles size={21} /></div>
          <div>
            <p className="eyebrow">העוזר החכם</p>
            <h2 id="pantry-assistant-title">בואי נבשל ממה שיש</h2>
          </div>
          <span className="assistant-status"><span /> מוכן לעזור</span>
        </div>
        <div className="assistant-messages" aria-live="polite">
          {visibleMessages.slice(-5).map((message) => (
            <div key={message.id} className={`assistant-message ${message.role === 'user' ? 'is-user' : 'is-assistant'}`}>
              <p>{message.text}</p>
              {message.role === 'assistant' && (
                <button type="button" className="assistant-speak" onClick={() => speak(message.text)} aria-label={isSpeaking ? 'עצור הקראה' : 'הקרא תשובה'}>
                  {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />} {isSpeaking ? 'עצור' : 'הקראה'}
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="assistant-actions">
          <button type="button" className="primary-button assistant-menu-button" onClick={() => { void buildMenu() }} disabled={pantryWords.size === 0 || isBuildingMenu}>
            <ChefHat size={19} /> {isBuildingMenu ? 'מרכיבה תפריט…' : 'בני לי תפריט ממה שיש'}
          </button>
          <button type="button" className="outline-button assistant-search-button" onClick={() => { void answer('חפשי לי מתכון') }} disabled={pantryWords.size === 0 || isChatting}>
            <Search size={18} /> חפשי לי מתכון
          </button>
        </div>
        <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); void answer(chatInput) }}>
          <label htmlFor="assistant-input" className="sr-only">שיחה עם העוזר</label>
          <input id="assistant-input" value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="למשל: מה אפשר להכין מהר?" />
          <button type="button" className={`voice-button ${isListening ? 'is-listening' : ''}`} onClick={toggleListening} aria-label={isListening ? 'עצור הקלטה' : 'דברי עם העוזר'}>
            {isListening ? <MicOff size={19} /> : <Mic size={19} />}
          </button>
          <button type="submit" className="send-button" disabled={!chatInput.trim() || isChatting} aria-label="שלחי הודעה"><Send size={18} /></button>
        </form>
        <div className="assistant-suggestions" aria-label="הצעות לשיחה">
          {['מה אפשר להכין מהר?', 'מה חסר לי למתכון?', 'תני לי גרסה צמחונית'].map((suggestion) => (
            <button type="button" key={suggestion} onClick={() => { void answer(suggestion) }} disabled={isChatting}>{suggestion}</button>
          ))}
        </div>
      </section>

      {menuOpen && pantryWords.size > 0 && (
        <section className="pantry-menu" aria-labelledby="pantry-menu-title">
          <div className="pantry-menu-heading">
            <div><p className="eyebrow">תפריט אישי להיום</p><h2 id="pantry-menu-title">מהמטבח שלך, בלי להסתבך</h2></div>
            <button type="button" className="outline-button" onClick={() => setMenuOpen(false)}>הסתרה</button>
          </div>
          {aiError && <p className="pantry-ai-error" role="alert">{aiError}</p>}
          <div className="pantry-menu-grid">
            {aiMenu ? aiMenu.map((meal) => (
              <article className="pantry-menu-card" key={`${meal.meal}-${meal.title}`}>
                <div className="pantry-menu-card-top"><span>{meal.meal}</span><Clock3 size={17} aria-hidden="true" /></div>
                <strong>{meal.title}</strong><p>{meal.description}</p>
                <details open><summary>מרכיבים ואופן הכנה</summary><div className="pantry-recipe-sections"><div><h4>מרכיבים</h4><ul>{meal.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul></div><div><h4>אופן הכנה</h4><ol>{meal.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol></div></div></details>
                {meal.missingIngredients.length > 0 && <p className="pantry-missing"><strong>כדאי לקנות:</strong> {meal.missingIngredients.join(', ')}</p>}
                {savedMeals[`${meal.meal}-${meal.title}`] ? <Link href={`/recipes/${savedMeals[`${meal.meal}-${meal.title}`]}`} className="text-button pantry-saved-link">נשמר — פתחי מתכון</Link> : <button type="button" className="primary-button pantry-save-button" onClick={() => { void saveMeal(meal) }} disabled={savingMeal !== null}>{savingMeal === `${meal.meal}-${meal.title}` ? 'שומרת…' : 'שמרי מתכון בספרייה'}</button>}
              </article>
            )) : menu.map(({ label, hint, result }) => (
              <article className="pantry-menu-card" key={label}>
                <div className="pantry-menu-card-top"><span>{label}</span><Clock3 size={17} aria-hidden="true" /></div>
                {result ? <><Link href={`/recipes/${result.recipe.id}`} className="pantry-menu-recipe">{result.recipe.title}</Link><p>{hint} · {result.percent}% התאמה</p><Link href={`/recipes/${result.recipe.id}`} className="text-button"><Play size={14} /> פתחי מתכון</Link></> : <><strong>נרכיב יחד רעיון</strong><p>אין עדיין התאמה בספרייה — שאלי אותי מה אפשר לבשל.</p></>}
              </article>
            ))}
          </div>
        </section>
      )}

      {pantryWords.size === 0 ? (
        <div className="empty-state">
          <p>הזיני מה יש לך במקרר או במזווה כדי לראות מתכונים תואמים.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <p>לא נמצאו מתכונים שתואמים{strict ? ' לחלוטין' : ''} למרכיבים שרשמת.</p>
          {strict && (
            <button type="button" className="outline-button" onClick={() => setStrict(false)}>
              הראי גם התאמות חלקיות
            </button>
          )}
        </div>
      ) : (
        <div>
          <p style={{ margin: '0 0 14px', color: 'var(--muted)' }}>{results.length} מתכונים תואמים</p>
          <div className="recipe-grid">
            {results.map(({ recipe, matched, missing, percent, missingList }) => {
              const totalMinutes = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)
              return (
                <article key={recipe.id} className="recipe-card">
                  <Link href={`/recipes/${recipe.id}`} className="recipe-visual" tabIndex={-1} aria-hidden="true">
                    {recipe.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={recipe.image_url} alt="" className="recipe-photo" loading="lazy" />
                    ) : (
                      <div className="recipe-photo" style={{ padding: 0 }}>
                        <RecipeImagePlaceholder
                          category={recipe.category}
                          title={recipe.title}
                          ingredientNames={recipe.ingredientNames}
                        />
                      </div>
                    )}
                  </Link>
                  <div
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: percent === 100 ? '#3b6035' : percent >= 70 ? '#c7a233' : '#8a6b3d',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '.82rem',
                    }}
                  >
                    {percent}%
                  </div>
                  <div className="recipe-info">
                    <Link href={`/recipes/${recipe.id}`}>
                      <h3>{recipe.title}</h3>
                    </Link>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '.82rem' }}>
                      <span style={{ color: '#3b6035', fontWeight: 700 }}>✓ יש לי {matched} מרכיבים</span>
                      {missing > 0 && (
                        <span style={{ color: 'var(--muted)' }}>
                          חסר: {missingList.slice(0, 3).join(', ')}{missingList.length > 3 ? '…' : ''}
                        </span>
                      )}
                      {totalMinutes > 0 && <span style={{ color: 'var(--muted)' }}>{totalMinutes} דק׳</span>}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
