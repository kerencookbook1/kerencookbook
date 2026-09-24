'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { SearchDialog } from './search-dialog'
import { WebSearchDrawer } from './web-search-drawer'

type SearchContextValue = {
  open: () => void
  close: () => void
  isOpen: boolean
  openWebSearch: () => void
  closeWebSearch: () => void
  isWebSearchOpen: boolean
}

const SearchContext = createContext<SearchContextValue>({
  open: () => {},
  close: () => {},
  isOpen: false,
  openWebSearch: () => {},
  closeWebSearch: () => {},
  isWebSearchOpen: false,
})

export function useSearch(): SearchContextValue {
  return useContext(SearchContext)
}

/**
 * Wraps the app so any child can call useSearch().open() to pop the
 * search dialog. Also binds ⌘K / Ctrl+K to open globally.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isWebSearchOpen, setIsWebSearchOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setIsOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <SearchContext.Provider
      value={{
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        isOpen,
        openWebSearch: () => setIsWebSearchOpen(true),
        closeWebSearch: () => setIsWebSearchOpen(false),
        isWebSearchOpen,
      }}
    >
      {children}
      <SearchDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <WebSearchDrawer isOpen={isWebSearchOpen} onClose={() => setIsWebSearchOpen(false)} />
    </SearchContext.Provider>
  )
}
