'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RECIPE_IMAGES_BUCKET, resolveRecipeImageUrl } from '@/lib/recipe-image-url'

export type EditorImage = {
  id: string
  storage_path: string
  is_primary: boolean
  position: number
}

type Props = {
  recipeId: string
  ownerId: string
  initial: EditorImage[]
}

type UploadingItem = {
  tempId: string
  previewUrl: string
  progress: 'uploading' | 'saving' | 'error'
  errorMsg?: string
}

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB — mirrors the bucket file_size_limit
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/**
 * Client-side image editor for a recipe.
 * - Lists existing images with a "primary" badge and a delete button.
 * - "צלמי" opens the device camera on mobile (rear-facing by default).
 * - "העלי" opens the standard file picker.
 * - Uploads run directly to Supabase Storage; the browser client is authed
 *   via cookies so RLS lets the recipe owner write under `{ownerId}/{recipeId}/*`.
 * - Shows optimistic previews while uploads/rows-inserts are in flight.
 */
export function RecipeImagesEditor({ recipeId, ownerId, initial }: Props) {
  const supabase = createClient()
  const [images, setImages] = useState<EditorImage[]>(
    [...initial].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position),
  )
  const [uploading, setUploading] = useState<UploadingItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const primaryId = images.find((i) => i.is_primary)?.id ?? images[0]?.id ?? null

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)

    for (const file of Array.from(files)) {
      const tempId = crypto.randomUUID()

      if (!ALLOWED_MIME.includes(file.type)) {
        setError(`סוג הקובץ ${file.type || '(לא מוכר)'} לא נתמך. השתמשי ב-JPG · PNG · WebP · GIF.`)
        continue
      }
      if (file.size > MAX_BYTES) {
        setError(`הקובץ גדול מדי (${(file.size / 1024 / 1024).toFixed(1)}MB). המקסימום הוא 5MB.`)
        continue
      }

      const previewUrl = URL.createObjectURL(file)
      setUploading((prev) => [...prev, { tempId, previewUrl, progress: 'uploading' }])

      // Build storage path: {ownerId}/{recipeId}/{uuid}.{ext}
      const ext = file.name.split('.').pop()?.toLowerCase() || file.type.split('/')[1] || 'jpg'
      const objectName = `${ownerId}/${recipeId}/${crypto.randomUUID()}.${ext}`

      const upload = await supabase.storage
        .from(RECIPE_IMAGES_BUCKET)
        .upload(objectName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

      if (upload.error) {
        setUploading((prev) =>
          prev.map((u) =>
            u.tempId === tempId ? { ...u, progress: 'error', errorMsg: upload.error.message } : u,
          ),
        )
        setError(`העלאה נכשלה: ${upload.error.message}`)
        continue
      }

      setUploading((prev) =>
        prev.map((u) => (u.tempId === tempId ? { ...u, progress: 'saving' } : u)),
      )

      const isFirst = images.length === 0 && uploading.length === 0
      const nextPosition =
        (images.reduce((m, i) => Math.max(m, i.position), -1) + 1) || 0

      const insert = await supabase
        .from('recipe_images')
        .insert({
          recipe_id: recipeId,
          storage_path: objectName,
          is_primary: isFirst,
          position: nextPosition,
        })
        .select('id, storage_path, is_primary, position')
        .single()

      if (insert.error || !insert.data) {
        // Row insert failed — roll back the storage upload so we don't orphan files.
        await supabase.storage.from(RECIPE_IMAGES_BUCKET).remove([objectName])
        setUploading((prev) =>
          prev.map((u) =>
            u.tempId === tempId
              ? { ...u, progress: 'error', errorMsg: insert.error?.message ?? 'שמירה נכשלה' }
              : u,
          ),
        )
        setError(insert.error?.message ?? 'שמירה נכשלה')
        continue
      }

      const saved = insert.data as EditorImage
      setImages((prev) => [...prev, saved])
      setUploading((prev) => prev.filter((u) => u.tempId !== tempId))
      URL.revokeObjectURL(previewUrl)
    }
  }, [images.length, ownerId, recipeId, supabase, uploading.length])

  useEffect(() => () => {
    for (const u of uploading) URL.revokeObjectURL(u.previewUrl)
  }, [uploading])

  async function remove(image: EditorImage) {
    setError(null)
    const nextList = images.filter((i) => i.id !== image.id)

    // If we're removing the primary and other images exist, promote the next one.
    let promoteId: string | null = null
    if (image.is_primary && nextList.length > 0) {
      promoteId = nextList[0]!.id
      nextList[0] = { ...nextList[0]!, is_primary: true }
    }

    setImages(nextList)

    // Delete the row (cascades cleanly since we then remove the storage object).
    const del = await supabase.from('recipe_images').delete().eq('id', image.id)
    if (del.error) {
      setImages(images)
      setError(`מחיקה נכשלה: ${del.error.message}`)
      return
    }

    // Best-effort remove the storage object. Only for internal paths — external
    // URLs (legacy) live outside our bucket.
    if (!/^https?:\/\//i.test(image.storage_path)) {
      await supabase.storage.from(RECIPE_IMAGES_BUCKET).remove([image.storage_path])
    }

    if (promoteId) {
      await supabase.from('recipe_images').update({ is_primary: true }).eq('id', promoteId)
    }
  }

  async function makePrimary(image: EditorImage) {
    if (image.is_primary) return
    setError(null)
    const optimistic = images.map((i) => ({ ...i, is_primary: i.id === image.id }))
    setImages(optimistic)

    const oldPrimaryId = images.find((i) => i.is_primary && i.id !== image.id)?.id
    if (oldPrimaryId) {
      await supabase.from('recipe_images').update({ is_primary: false }).eq('id', oldPrimaryId)
    }
    const upd = await supabase.from('recipe_images').update({ is_primary: true }).eq('id', image.id)
    if (upd.error) {
      setImages(images)
      setError(`עדכון נכשל: ${upd.error.message}`)
    }
  }

  const hasContent = images.length > 0 || uploading.length > 0

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="outline-button"
          style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <span aria-hidden>📷</span> צלמי מהמצלמה
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="outline-button"
          style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <span aria-hidden>🖼️</span> העלי מהמכשיר
        </button>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
          hidden
          aria-hidden
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
          hidden
          aria-hidden
        />
      </div>

      {error && (
        <p className="auth-error" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      )}

      {hasContent ? (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gap: 10,
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          }}
          aria-label="תמונות המתכון"
        >
          {images.map((img) => {
            const url = resolveRecipeImageUrl(null, img.storage_path)
            const isPrimary = img.id === primaryId
            return (
              <li
                key={img.id}
                style={{
                  position: 'relative',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: `2px solid ${isPrimary ? 'var(--terracotta-dark, #4d7c0f)' : 'var(--line, #e5e5e5)'}`,
                  background: 'var(--surface, #fff)',
                  aspectRatio: '4/3',
                }}
              >
                {url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {isPrimary && (
                  <span
                    style={{
                      position: 'absolute', top: 6, insetInlineStart: 6,
                      background: 'var(--terracotta-dark, #4d7c0f)', color: '#fff',
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                    }}
                  >
                    ראשית
                  </span>
                )}
                <div
                  style={{
                    position: 'absolute', bottom: 6, insetInlineStart: 6, insetInlineEnd: 6,
                    display: 'flex', gap: 4, justifyContent: 'space-between',
                  }}
                >
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => makePrimary(img)}
                      aria-label="הפכי לתמונה הראשית"
                      style={{
                        background: 'rgba(255,255,255,.92)', color: 'var(--ink, #171717)',
                        border: 'none', borderRadius: 999, padding: '5px 10px',
                        fontSize: 11, fontWeight: 600, minHeight: 30, cursor: 'pointer',
                      }}
                    >
                      ⭐ הפכי לראשית
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(img)}
                    aria-label="מחקי תמונה"
                    style={{
                      background: 'rgba(200,30,30,.92)', color: '#fff',
                      border: 'none', borderRadius: 999, padding: '5px 10px',
                      fontSize: 11, fontWeight: 700, minHeight: 30, cursor: 'pointer',
                      marginInlineStart: 'auto',
                    }}
                  >
                    ✕ מחקי
                  </button>
                </div>
              </li>
            )
          })}
          {uploading.map((u) => (
            <li
              key={u.tempId}
              style={{
                position: 'relative',
                borderRadius: 12,
                overflow: 'hidden',
                border: `2px dashed var(--line, #e5e5e5)`,
                background: 'var(--canvas, #fafaf9)',
                aspectRatio: '4/3',
              }}
              aria-live="polite"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u.previewUrl}
                alt=""
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  opacity: u.progress === 'error' ? .3 : .6,
                  filter: u.progress === 'error' ? 'grayscale(1)' : 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  color: u.progress === 'error' ? '#b91c1c' : 'var(--ink,#171717)',
                  background: 'rgba(255,255,255,.55)',
                  textAlign: 'center', padding: 8,
                }}
              >
                {u.progress === 'uploading' && 'מעלה...'}
                {u.progress === 'saving' && 'שומרת...'}
                {u.progress === 'error' && (u.errorMsg || 'שגיאה')}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div
          style={{
            padding: '20px 12px',
            textAlign: 'center',
            border: '2px dashed var(--line, #e5e5e5)',
            borderRadius: 12,
            background: 'var(--canvas, #fafaf9)',
            color: 'var(--muted, #525252)',
            fontSize: 13,
          }}
        >
          עדיין אין תמונה למתכון. צלמי או העלי כדי שהמתכון ייראה טוב ברשימות.
        </div>
      )}
    </div>
  )
}
