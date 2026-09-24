'use client'

import Link from 'next/link'
import { useEffect, useId } from 'react'

const GOOGLE_CSE_ID = '24b0305d0dd404ac5'
const GOOGLE_CSE_SCRIPT_ID = 'google-cse-script'

declare global {
  interface Window {
    __gcse?: { parsetags?: 'explicit' | 'onload' }
    google?: {
      search?: {
        cse?: {
          element?: {
            render: (options: { div: string; tag: string }) => void
          }
        }
      }
    }
  }
}

function renderGoogleSearch(containerId: string) {
  const element = window.google?.search?.cse?.element
  const container = document.getElementById(containerId)
  if (!element || !container) return false

  container.replaceChildren()
  element.render({ div: containerId, tag: 'search' })
  return true
}

export default function WebSearchPanel() {
  const containerId = `google-cse-${useId().replace(/:/g, '')}`

  useEffect(() => {
    let disposed = false
    let retryTimer: number | undefined
    let retries = 0

    window.__gcse = { ...(window.__gcse ?? {}), parsetags: 'explicit' }

    const render = () => {
      if (disposed || renderGoogleSearch(containerId)) return
      if (retries < 25) {
        retries += 1
        retryTimer = window.setTimeout(render, 120)
      }
    }

    const script = document.getElementById(GOOGLE_CSE_SCRIPT_ID) as HTMLScriptElement | null
    if (!script) {
      const nextScript = document.createElement('script')
      nextScript.id = GOOGLE_CSE_SCRIPT_ID
      nextScript.async = true
      nextScript.src = `https://cse.google.com/cse.js?cx=${GOOGLE_CSE_ID}`
      nextScript.addEventListener('load', render, { once: true })
      document.head.appendChild(nextScript)
    }

    const refreshOnReturn = () => {
      retries = 0
      window.setTimeout(render, 0)
    }

    window.addEventListener('pageshow', refreshOnReturn)
    document.addEventListener('visibilitychange', refreshOnReturn)
    render()

    return () => {
      disposed = true
      if (retryTimer) window.clearTimeout(retryTimer)
      window.removeEventListener('pageshow', refreshOnReturn)
      document.removeEventListener('visibilitychange', refreshOnReturn)
    }
  }, [containerId])

  return (
    <div className="web-search-only">
      <section className="google-cse-panel" aria-label="חיפוש Google באינטרנט">
        <div
          id={containerId}
          className="gcse-search"
          data-placeholder="הכניסי מה שאת מחפשת, למשל: עוגת שוקולד"
        />
      </section>
      <div className="web-search-import-note">
        <strong>מצאת מתכון באתר?</strong>
        <span>הדביקי את כתובת האתר כדי לייבא את המתכון לספר שלך.</span>
        <Link href="/import/url" className="outline-button">ייבוא מאתר</Link>
      </div>
    </div>
  )
}
