import { CATEGORIES, type CategoryId, guessCategory, isCategoryId } from '@/lib/categories'

/** Per-category tint used behind the emoji. Matches the tile colors on the home page. */
const TINT: Record<CategoryId, string> = {
  'בשר':         '#f5dad2',
  'עוף':         '#f7e2c0',
  'דגים':        '#d4e6f1',
  'חלבי':        '#f9f0d4',
  'צמחוני':      '#dcecd0',
  'פסטה':        '#f8e0d8',
  'אורז ודגנים': '#f0e5d0',
  'סלטים':       '#dceaca',
  'מרקים':       '#f5d4b8',
  'מאפים':       '#f0d9be',
  'קינוחים':     '#f4d3d8',
  'שתייה':       '#dfe4f0',
  'אחר':         '#eee6db',
}

/** Slightly darker version of the tint for the subtle gradient. */
const TINT_DEEP: Record<CategoryId, string> = {
  'בשר':         '#eabab0',
  'עוף':         '#ecc890',
  'דגים':        '#a9c9dc',
  'חלבי':        '#f1de9d',
  'צמחוני':      '#b6d3a4',
  'פסטה':        '#eabca8',
  'אורז ודגנים': '#dfceab',
  'סלטים':       '#b7d199',
  'מרקים':       '#e3ac81',
  'מאפים':       '#dfba95',
  'קינוחים':     '#e6a7b1',
  'שתייה':       '#b4bfd9',
  'אחר':         '#d9cdb9',
}

type Props = {
  category: string | null | undefined
  title?: string
  ingredientNames?: string[]
  className?: string
}

/** Resolve to a valid CategoryId — use stored value if it's a real category, else guess. */
function pickCategory(props: Props): CategoryId {
  if (isCategoryId(props.category)) return props.category
  if (props.title) return guessCategory(props.title, props.ingredientNames ?? [])
  return 'אחר'
}

/**
 * Fallback visual for a recipe that has no photo. Renders a big emoji drawing
 * of the dish type on a soft tinted background matching the category palette.
 * Cards can drop this in wherever they would otherwise use `<img />`.
 */
export function RecipeImagePlaceholder(props: Props) {
  const cat = pickCategory(props)
  const icon = CATEGORIES.find((c) => c.id === cat)?.icon ?? '🍽️'
  const bg = TINT[cat]
  const bgDeep = TINT_DEEP[cat]

  return (
    <div
      aria-hidden
      className={props.className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at 30% 30%, ${bg} 0%, ${bgDeep} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          fontSize: 'clamp(64px, 40%, 140px)',
          lineHeight: 1,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.12))',
          transform: 'translateZ(0)',
        }}
      >
        {icon}
      </span>
      {/* subtle corner label — helps the user learn categories over time */}
      <span
        style={{
          position: 'absolute',
          bottom: 8,
          insetInlineStart: 10,
          fontSize: 11,
          fontWeight: 700,
          color: 'rgba(0,0,0,.42)',
          letterSpacing: '.02em',
        }}
      >
        {cat}
      </span>
    </div>
  )
}
