'use client'
import { useEffect } from 'react'

export function ThemeInit() {
  useEffect(() => {
    try {
      const t = localStorage.getItem('theme') || 'modern'
      document.documentElement.setAttribute('data-theme', t)
    } catch {}
  }, [])
  return null
}
