'use client'

import { useEffect, useRef } from 'react'
import WebSearchPanel from '../web-search/web-search-panel'

export function WebSearchDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="web-search-drawer-layer" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <aside className="web-search-drawer" role="dialog" aria-modal="true" aria-labelledby="web-search-drawer-title">
        <header className="web-search-drawer-header">
          <div>
            <p className="eyebrow">חיפוש בגוגל</p>
            <h2 id="web-search-drawer-title">מצאי מתכון וייבאי אותו</h2>
          </div>
          <button ref={closeButtonRef} type="button" className="drawer-close-button" onClick={onClose} aria-label="סגירת חיפוש">×</button>
        </header>
        <div className="web-search-drawer-content">
          <WebSearchPanel />
        </div>
      </aside>
    </div>
  )
}
