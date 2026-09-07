'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

type Rect = { x: number; y: number; w: number; h: number }  // normalized 0..1
type DragMode = 'none' | 'move' | 'nw' | 'ne' | 'sw' | 'se'

/**
 * Drag-a-rectangle crop tool. Works with mouse and touch (pointer events).
 * Displays the source image, an overlay darkening cropped-out regions,
 * and 4 corner handles. Calls onApply with a cropped Blob.
 */
export function ImageCropper({
  src,
  onApply,
  onCancel,
}: {
  src: string
  onApply: (cropped: Blob) => void
  onCancel: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [rect, setRect] = useState<Rect>({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 })
  const dragRef = useRef<{
    mode: DragMode
    startX: number
    startY: number
    startRect: Rect
    containerW: number
    containerH: number
  } | null>(null)
  const [busy, setBusy] = useState(false)

  function clampRect(r: Rect): Rect {
    const min = 0.05
    let { x, y, w, h } = r
    w = Math.max(min, Math.min(1, w))
    h = Math.max(min, Math.min(1, h))
    x = Math.max(0, Math.min(1 - w, x))
    y = Math.max(0, Math.min(1 - h, y))
    return { x, y, w, h }
  }

  function onPointerDown(mode: DragMode, e: ReactPointerEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return
    const bounds = container.getBoundingClientRect()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startRect: rect,
      containerW: bounds.width,
      containerH: bounds.height,
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.mode === 'none') return
    const dxN = (e.clientX - drag.startX) / drag.containerW
    const dyN = (e.clientY - drag.startY) / drag.containerH
    // RTL layout: horizontal drag direction is inverted for user perception,
    // but in raw client coordinates it's the same as LTR. We compute in
    // container-relative normalized coords which are always LTR.
    const s = drag.startRect
    let next: Rect = { ...s }
    if (drag.mode === 'move') {
      next = { ...s, x: s.x + dxN, y: s.y + dyN }
    } else if (drag.mode === 'nw') {
      next = { x: s.x + dxN, y: s.y + dyN, w: s.w - dxN, h: s.h - dyN }
    } else if (drag.mode === 'ne') {
      next = { x: s.x, y: s.y + dyN, w: s.w + dxN, h: s.h - dyN }
    } else if (drag.mode === 'sw') {
      next = { x: s.x + dxN, y: s.y, w: s.w - dxN, h: s.h + dyN }
    } else if (drag.mode === 'se') {
      next = { x: s.x, y: s.y, w: s.w + dxN, h: s.h + dyN }
    }
    setRect(clampRect(next))
  }

  function onPointerUp() {
    dragRef.current = null
  }

  useEffect(() => {
    // Reset default rect whenever the image source changes
    setRect({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 })
  }, [src])

  async function applyCrop() {
    const img = imgRef.current
    if (!img) return
    setBusy(true)
    try {
      const bitmap = await createImageBitmap(await (await fetch(src)).blob())
      const sx = Math.round(rect.x * bitmap.width)
      const sy = Math.round(rect.y * bitmap.height)
      const sw = Math.round(rect.w * bitmap.width)
      const sh = Math.round(rect.h * bitmap.height)
      const canvas = document.createElement('canvas')
      canvas.width = sw
      canvas.height = sh
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh)
      bitmap.close?.()
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('crop failed'))), 'image/jpeg', 0.92)
      })
      onApply(blob)
    } finally {
      setBusy(false)
    }
  }

  const boxStyle = {
    left: `${rect.x * 100}%`,
    top: `${rect.y * 100}%`,
    width: `${rect.w * 100}%`,
    height: `${rect.h * 100}%`,
  }

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          maxWidth: '100%',
          maxHeight: 500,
          margin: '0 auto',
          background: '#333',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt="לחיתוך"
          style={{ display: 'block', maxWidth: '100%', maxHeight: 500, margin: '0 auto', pointerEvents: 'none' }}
        />
        {/* Dark overlay + transparent crop window (4 rectangles around the crop) */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: `${rect.y * 100}%`, background: 'rgba(0,0,0,.55)' }} />
          <div style={{ position: 'absolute', left: 0, top: `${(rect.y + rect.h) * 100}%`, width: '100%', height: `${(1 - rect.y - rect.h) * 100}%`, background: 'rgba(0,0,0,.55)' }} />
          <div style={{ position: 'absolute', left: 0, top: `${rect.y * 100}%`, width: `${rect.x * 100}%`, height: `${rect.h * 100}%`, background: 'rgba(0,0,0,.55)' }} />
          <div style={{ position: 'absolute', left: `${(rect.x + rect.w) * 100}%`, top: `${rect.y * 100}%`, width: `${(1 - rect.x - rect.w) * 100}%`, height: `${rect.h * 100}%`, background: 'rgba(0,0,0,.55)' }} />
        </div>
        {/* Crop rectangle */}
        <div
          onPointerDown={(e) => onPointerDown('move', e)}
          style={{
            position: 'absolute',
            ...boxStyle,
            border: '2px solid #ffc885',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.35)',
            cursor: 'move',
          }}
        >
          {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
            <div
              key={corner}
              onPointerDown={(e) => onPointerDown(corner, e)}
              style={{
                position: 'absolute',
                width: 24, height: 24,
                background: '#ffc885',
                border: '2px solid #40522a',
                borderRadius: '50%',
                cursor:
                  corner === 'nw' ? 'nwse-resize' :
                  corner === 'se' ? 'nwse-resize' :
                  'nesw-resize',
                touchAction: 'none',
                ...(corner.includes('n') ? { top: -12 } : { bottom: -12 }),
                ...(corner.includes('w') ? { left: -12 } : { right: -12 }),
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
        <button type="button" className="outline-button" onClick={onCancel} disabled={busy}>ביטול</button>
        <button
          type="button"
          className="outline-button"
          onClick={() => setRect({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 })}
          disabled={busy}
        >
          איפוס
        </button>
        <button type="button" className="primary-button" onClick={applyCrop} disabled={busy}>
          {busy ? 'חותך…' : '✂️ חתכי'}
        </button>
      </div>
      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.85rem', margin: '10px 0 0' }}>
        גררי את המסגרת או את הידיות בפינות כדי לבחור את האזור לחיתוך
      </p>
    </div>
  )
}
