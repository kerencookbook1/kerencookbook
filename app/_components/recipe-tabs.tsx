'use client'

import { useState, type ReactNode } from 'react'

type Tab = {
  id: string
  label: string
  icon: string
  content: ReactNode
  hidden?: boolean
}

export function RecipeTabs({ tabs, defaultTab = 'overview' }: { tabs: Tab[]; defaultTab?: string }) {
  const visibleTabs = tabs.filter((t) => !t.hidden)
  const [activeId, setActiveId] = useState<string>(
    visibleTabs.find((t) => t.id === defaultTab)?.id ?? visibleTabs[0]?.id ?? ''
  )
  const active = visibleTabs.find((t) => t.id === activeId) ?? visibleTabs[0]

  return (
    <>
      <div className="recipe-tabbar" role="tablist" aria-label="חלקי המתכון">
        {visibleTabs.map((tab) => {
          const isActive = tab.id === activeId
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`recipe-tab-${tab.id}`}
              className={`recipe-tab${isActive ? ' is-active' : ''}`}
              onClick={() => setActiveId(tab.id)}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        id={`recipe-tab-${active?.id}`}
        role="tabpanel"
        aria-labelledby={`recipe-tab-btn-${active?.id}`}
        className="recipe-tab-panel"
      >
        {active?.content}
      </div>
    </>
  )
}
