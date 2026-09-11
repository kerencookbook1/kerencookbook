'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

type Props = {
  value: string
  onChange: (next: string) => void
  suggestions: string[]
  placeholder?: string
  ariaLabel?: string
  className?: string
}

const MAX_VISIBLE = 8

/**
 * Accessible combobox for ingredient names. Renders a visible dropdown of
 * matching suggestions instead of the native <datalist>, which is inconsistent
 * across browsers (especially on mobile / RTL).
 *
 * Keyboard: ArrowUp/Down navigates, Enter selects, Escape closes.
 * Mouse/Touch: click item to select. Tap targets are ≥40px per row.
 * Match: case-insensitive substring on the raw name, ranked so exact
 * "starts with" matches appear before deeper substring matches.
 */
export function IngredientCombobox({
  value,
  onChange,
  suggestions,
  placeholder,
  ariaLabel,
  className,
}: Props) {
  const listboxId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState<number>(-1)

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return suggestions.slice(0, MAX_VISIBLE)
    const starts: string[] = []
    const contains: string[] = []
    for (const s of suggestions) {
      const l = s.toLowerCase()
      if (l === q) continue
      if (l.startsWith(q)) starts.push(s)
      else if (l.includes(q)) contains.push(s)
      if (starts.length + contains.length >= MAX_VISIBLE * 2) break
    }
    return [...starts, ...contains].slice(0, MAX_VISIBLE)
  }, [value, suggestions])

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node | null
      if (!t) return
      if (inputRef.current?.contains(t)) return
      if (listRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  useEffect(() => {
    if (open && highlight >= 0 && listRef.current) {
      const el = listRef.current.querySelector<HTMLElement>(
        `[data-idx="${highlight}"]`,
      )
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlight, open])

  function commit(next: string) {
    onChange(next)
    setOpen(false)
    setHighlight(-1)
    inputRef.current?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) setOpen(true)
      setHighlight((h) => Math.min(matches.length - 1, h + 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) setOpen(true)
      setHighlight((h) => Math.max(0, h - 1))
      return
    }
    if (e.key === 'Enter') {
      if (open && highlight >= 0 && matches[highlight]) {
        e.preventDefault()
        commit(matches[highlight]!)
      }
      return
    }
    if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        setOpen(false)
        setHighlight(-1)
      }
    }
  }

  const activeId =
    open && highlight >= 0 ? `${listboxId}-opt-${highlight}` : undefined

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setHighlight(-1)
        }}
        onFocus={() => {
          if (matches.length > 0) setOpen(true)
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
        className={className}
        style={{ width: '100%' }}
      />

      {open && matches.length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="הצעות מרכיב"
          style={{
            position: 'absolute',
            insetInlineStart: 0,
            insetInlineEnd: 0,
            top: 'calc(100% + 4px)',
            zIndex: 30,
            background: 'var(--surface, #ffffff)',
            border: '1px solid var(--line, #e5e5e5)',
            borderRadius: 10,
            boxShadow: '0 8px 24px -6px rgba(0,0,0,.15), 0 4px 12px -4px rgba(0,0,0,.08)',
            maxHeight: 320,
            overflowY: 'auto',
            listStyle: 'none',
            margin: 0,
            padding: 4,
            direction: 'rtl',
          }}
        >
          {matches.map((s, idx) => {
            const active = idx === highlight
            return (
              <li
                key={s}
                id={`${listboxId}-opt-${idx}`}
                role="option"
                aria-selected={active}
                data-idx={idx}
                onMouseEnter={() => setHighlight(idx)}
                onMouseDown={(e) => {
                  // preventDefault so input doesn't blur before we commit
                  e.preventDefault()
                  commit(s)
                }}
                style={{
                  padding: '10px 12px',
                  minHeight: 40,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 15,
                  color: active ? '#0a0a0a' : 'var(--ink, #171717)',
                  background: active ? 'var(--terracotta-bg, #ecfccb)' : 'transparent',
                  fontWeight: active ? 600 : 400,
                  transition: 'background 100ms ease',
                }}
              >
                <Match query={value} text={s} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Match({ query, text }: { query: string; text: string }) {
  const q = query.trim().toLowerCase()
  if (!q) return <>{text}</>
  const i = text.toLowerCase().indexOf(q)
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <strong style={{ fontWeight: 700, color: 'var(--terracotta-dark, #4d7c0f)' }}>
        {text.slice(i, i + q.length)}
      </strong>
      {text.slice(i + q.length)}
    </>
  )
}
