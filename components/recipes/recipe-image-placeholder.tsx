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
 * Sub-category emoji overrides. When a poultry recipe is specifically turkey,
 * beef is a hamburger, or fish is salmon, we swap the emoji so the placeholder
 * feels tuned to the actual dish. The tint stays with the parent category.
 * Add new entries here as feedback comes in.
 */
const SUBCATEGORY_OVERRIDES: Array<{
  parent: CategoryId
  keywords: string[]
  emoji: string
  label: string
}> = [
  { parent: 'עוף',   keywords: ['הודו', 'turkey'],                 emoji: '🦃', label: 'הודו' },
  { parent: 'בשר',   keywords: ['המבורגר', 'burger', 'hamburger'], emoji: '🍔', label: 'המבורגר' },
  { parent: 'בשר',   keywords: ['נקניק', 'sausage', 'hotdog', 'hot dog'], emoji: '🌭', label: 'נקניק' },
  { parent: 'דגים',  keywords: ['שרימפס', 'סרטן', 'shrimp', 'crab'], emoji: '🦐', label: 'פירות ים' },
  { parent: 'קינוחים', keywords: ['גלידה', 'סורבה', 'ice cream'], emoji: '🍨', label: 'גלידה' },
  { parent: 'קינוחים', keywords: ['עוגיה', 'cookie'],              emoji: '🍪', label: 'עוגיות' },
  { parent: 'מאפים', keywords: ['פיצה', 'pizza'],                  emoji: '🍕', label: 'פיצה' },
  { parent: 'מאפים', keywords: ['בייגל', 'bagel'],                 emoji: '🥯', label: 'בייגל' },
  { parent: 'שתייה',  keywords: ['קפה', 'coffee', 'אספרסו'],       emoji: '☕', label: 'קפה' },
  { parent: 'שתייה',  keywords: ['תה', 'tea'],                     emoji: '🍵', label: 'תה' },
]

function refineIcon(parent: CategoryId, title: string, ingredientNames: string[]): { icon: string; label: string } {
  const haystack = [title, ...ingredientNames].join(' ').toLowerCase()
  for (const rule of SUBCATEGORY_OVERRIDES) {
    if (rule.parent !== parent) continue
    if (rule.keywords.some((k) => haystack.includes(k.toLowerCase()))) {
      return { icon: rule.emoji, label: rule.label }
    }
  }
  const fallback = CATEGORIES.find((c) => c.id === parent)?.icon ?? '🍽️'
  return { icon: fallback, label: parent }
}

/**
 * Fallback visual for a recipe that has no photo. Renders a big emoji drawing
 * of the dish type on a soft tinted background matching the category palette.
 * Cards can drop this in wherever they would otherwise use `<img />`.
 */
export function RecipeImagePlaceholder(props: Props) {
  const cat = pickCategory(props)
  const { icon, label } = refineIcon(cat, props.title ?? '', props.ingredientNames ?? [])
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
        {label}
      </span>
    </div>
  )
}
