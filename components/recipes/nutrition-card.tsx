'use client'

import { useMemo, useState } from 'react'
import {
  estimateNutrition,
  ALLERGEN_LABELS,
  type AllergenId,
} from '@/lib/nutrition'
import type { IngredientForCalories } from '@/lib/calorie-calc'

type Props = {
  ingredients: IngredientForCalories[]
  servings: number | null
}

/**
 * Colorful nutrition card modeled on the reference from myrecipebook.co.il —
 * six macro tiles, a 3-color macro-split bar, vegetarian + allergen tags,
 * and a per-serving disclosure. All computed client-side from the same
 * calorie DB the CalorieButton uses.
 */
export function NutritionCard({ ingredients, servings }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const nutrition = useMemo(
    () => estimateNutrition(ingredients, servings),
    [ingredients, servings],
  )
  const { perServing, precision, isVegetarian, allergens } = nutrition

  // Percent of kcal from each macro for the bar
  const kcalFromP = perServing.proteinG * 4
  const kcalFromC = perServing.carbsG * 4
  const kcalFromF = perServing.fatG * 9
  const kcalSum = Math.max(1, kcalFromP + kcalFromC + kcalFromF)
  const pctP = Math.round((kcalFromP / kcalSum) * 100)
  const pctC = Math.round((kcalFromC / kcalSum) * 100)
  const pctF = 100 - pctP - pctC

  const precisionLabel =
    precision === 'high' ? 'גבוה' : precision === 'medium' ? 'בינוני' : 'נמוך'

  return (
    <div
      dir="rtl"
      style={{
        background: '#fffdf9',
        border: '1px solid #e7dec9',
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 2px 8px -4px rgba(58,45,25,.1)',
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        style={{
          all: 'unset',
          cursor: 'pointer',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: collapsed ? 0 : 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }} aria-hidden>🥗</span>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2a2620' }}>
            ערכים תזונתיים <span style={{ color: '#6b6357', fontWeight: 500, fontSize: '.9rem' }}>(למנה אחת)</span>
          </span>
        </div>
        <span
          aria-hidden
          style={{
            fontSize: 18,
            color: '#6b6357',
            transition: 'transform .2s ease',
            transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        >
          ⌃
        </span>
      </button>

      {!collapsed && (
        <>
          {/* 6 tiles — 3 columns × 2 rows */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 14,
              marginBottom: 22,
            }}
          >
            <Tile emoji="🔥" value={perServing.kcal} unit="" label="קלוריות" color="#E76F3E" />
            <Tile emoji="🥩" value={perServing.proteinG} unit="g" label="חלבון"     color="#DA3E3E" />
            <Tile emoji="🍞" value={perServing.carbsG}   unit="g" label="פחמימות" color="#E8B33A" />
            <Tile emoji="🧈" value={perServing.fatG}     unit="g" label="שומן"     color="#3B7BE0" />
            <Tile emoji="🌿" value={perServing.fiberG}   unit="g" label="סיבים"   color="#4EA73C" />
            <Tile emoji="🍯" value={perServing.sugarG}   unit="g" label="סוכר"     color="#D95A8E" />
          </div>

          {/* Macro breakdown bar */}
          <div style={{ marginBottom: 8 }}>
            <div
              aria-label="חלוקת מקרו-נוטריינטים"
              style={{
                height: 12,
                width: '100%',
                background: '#f0e5d0',
                borderRadius: 999,
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <div style={{ width: `${pctP}%`, background: '#3B7BE0' }} title={`חלבון ${pctP}%`} />
              <div style={{ width: `${pctC}%`, background: '#E8B33A' }} title={`פחמימות ${pctC}%`} />
              <div style={{ width: `${pctF}%`, background: '#E76F3E' }} title={`שומן ${pctF}%`} />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 6,
                fontSize: '.78rem',
                fontWeight: 600,
                color: '#6b6357',
              }}
            >
              <span style={{ color: '#3B7BE0' }}>חלבון {pctP}%</span>
              <span style={{ color: '#B98B14' }}>פחמימות {pctC}%</span>
              <span style={{ color: '#C15022' }}>שומן {pctF}%</span>
            </div>
          </div>

          {/* Vegetarian tag */}
          {isVegetarian && (
            <div style={{ marginTop: 14 }}>
              <span style={pillStyle('#EAF1E3', '#3f6212')}>🌱 צמחוני</span>
            </div>
          )}

          {/* Allergens */}
          {allergens.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#6b6357', marginBottom: 6 }}>
                <span aria-hidden>🏷️</span> אלרגנים:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {allergens.map((a) => (
                  <span key={a} style={allergenPillStyle(a)}>
                    {allergenIcon(a)} {ALLERGEN_LABELS[a]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer meta */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px dashed #e7dec9',
              fontSize: '.82rem',
              color: '#6b6357',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <span>
              📊 {nutrition.servings} מנות · דיוק: <strong style={{ color: '#2a2620' }}>{precisionLabel}</strong>
            </span>
            <span style={{ opacity: .8 }}>
              ⚠️ הערכים מחושבים היוריסטית ומשמשים להערכה כללית בלבד.
            </span>
          </div>
        </>
      )}
    </div>
  )
}

/* ─── sub-components ─────────────────────────────────────────────────────── */

function Tile({
  emoji,
  value,
  unit,
  label,
  color,
}: {
  emoji: string
  value: number
  unit: string
  label: string
  color: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px 6px',
        borderRadius: 14,
        background: '#fffdf6',
        border: `1.5px solid ${color}22`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.6rem, 2.4vw, 2rem)',
            fontWeight: 900,
            color,
            lineHeight: 1,
            letterSpacing: '-.02em',
          }}
        >
          {value}
          {unit && <span style={{ fontSize: '.85em' }}>{unit}</span>}
        </span>
        <span style={{ fontSize: '1.4rem' }} aria-hidden>{emoji}</span>
      </div>
      <div style={{ marginTop: 6, fontSize: '.78rem', color: '#6b6357', fontWeight: 600 }}>{label}</div>
    </div>
  )
}

function pillStyle(bg: string, fg: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '5px 12px',
    background: bg,
    color: fg,
    borderRadius: 999,
    fontSize: '.82rem',
    fontWeight: 700,
  }
}

const ALLERGEN_COLORS: Record<AllergenId, { bg: string; fg: string }> = {
  gluten:    { bg: '#EAF1E3', fg: '#3f6212' },
  egg:       { bg: '#FDECEA', fg: '#8a1c14' },
  dairy:     { bg: '#DBEAFE', fg: '#0C4A6E' },
  nuts:      { bg: '#FDF0D8', fg: '#78350F' },
  sesame:    { bg: '#F5EFE6', fg: '#7C2D12' },
  fish:      { bg: '#DFEDF2', fg: '#0C4A6E' },
  shellfish: { bg: '#DFEDF2', fg: '#0C4A6E' },
  soy:       { bg: '#FEF3C7', fg: '#78350F' },
}

function allergenPillStyle(a: AllergenId): React.CSSProperties {
  const c = ALLERGEN_COLORS[a]
  return pillStyle(c.bg, c.fg)
}

function allergenIcon(a: AllergenId): string {
  switch (a) {
    case 'gluten':    return '🌾'
    case 'egg':       return '🥚'
    case 'dairy':     return '🥛'
    case 'nuts':      return '🥜'
    case 'sesame':    return '🌰'
    case 'fish':      return '🐟'
    case 'shellfish': return '🦐'
    case 'soy':       return '🌱'
  }
}
