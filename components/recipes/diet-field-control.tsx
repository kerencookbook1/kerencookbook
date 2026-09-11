'use client'

import { useMemo } from 'react'
import { isDietAuto } from '@/lib/diet'

export type DietOverride = 'auto' | 'on' | 'off'

export function overrideFromDb(v: boolean | null | undefined): DietOverride {
  if (v === true) return 'on'
  if (v === false) return 'off'
  return 'auto'
}

type Props = {
  title: string
  ingredientNames: string[]
  override: DietOverride
  onOverrideChange: (next: DietOverride) => void
}

/**
 * Renders the "מתכון דיאטטי" checkbox with a live auto-value derived from
 * title + ingredients. First user click locks the override; a reset link
 * returns to auto-detection.
 */
export function DietFieldControl({ title, ingredientNames, override, onOverrideChange }: Props) {
  const autoValue = useMemo(
    () => isDietAuto(title, ingredientNames),
    [title, ingredientNames]
  )
  const checked = override === 'on' ? true : override === 'off' ? false : autoValue
  const locked = override !== 'auto'

  return (
    <div className="diet-field">
      <label className="diet-checkbox-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onOverrideChange(e.target.checked ? 'on' : 'off')}
        />
        <span>מתכון דיאטטי</span>
      </label>
      <p className="diet-hint">
        {locked ? (
          <>
            ננעל •{' '}
            <button
              type="button"
              className="diet-reset"
              onClick={() => onOverrideChange('auto')}
            >
              החזר לזיהוי אוטומטי
            </button>
          </>
        ) : (
          'מסומן אוטומטית לפי המרכיבים — סמן/בטל כדי לנעול'
        )}
      </p>
    </div>
  )
}
