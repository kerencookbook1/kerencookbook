import type { CSSProperties } from 'react'

type Variant = 'grid' | 'list' | 'detail' | 'form' | 'plain'

const shimmer: CSSProperties = {
  background:
    'linear-gradient(90deg, var(--surface, #fff) 0%, var(--canvas, #f5f5f4) 50%, var(--surface, #fff) 100%)',
  backgroundSize: '200% 100%',
  animation: 'route-skeleton-shimmer 1.4s ease-in-out infinite',
}

function Bar({ w = '100%', h = 14, r = 6, mb = 8 }: { w?: string | number; h?: number; r?: number; mb?: number }) {
  return (
    <div
      aria-hidden
      style={{
        width: w,
        height: h,
        borderRadius: r,
        marginBottom: mb,
        border: '1px solid var(--line, #e5e5e5)',
        ...shimmer,
      }}
    />
  )
}

function Card({ h = 260 }: { h?: number }) {
  return (
    <div
      aria-hidden
      style={{
        borderRadius: 12,
        border: '1px solid var(--line, #e5e5e5)',
        background: 'var(--surface, #fff)',
        overflow: 'hidden',
      }}
    >
      <div style={{ height: Math.round(h * 0.6), ...shimmer, borderBottom: '1px solid var(--line, #e5e5e5)' }} />
      <div style={{ padding: 14 }}>
        <Bar w="70%" h={16} mb={10} />
        <Bar w="40%" h={12} mb={0} />
      </div>
    </div>
  )
}

export function RouteSkeleton({ variant = 'grid', title }: { variant?: Variant; title?: string }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      style={{ padding: '24px 20px', maxWidth: 1240, margin: '0 auto', width: '100%' }}
    >
      <style>{`
        @keyframes route-skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-busy="true"] * { animation-duration: 0s !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      {title && (
        <div style={{ marginBottom: 18 }}>
          <Bar w={220} h={30} r={8} mb={10} />
          <Bar w={140} h={14} mb={0} />
        </div>
      )}

      {variant === 'grid' && (
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            marginTop: title ? 20 : 8,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} />
          ))}
        </div>
      )}

      {variant === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr 60px',
                gap: 12,
                alignItems: 'center',
                padding: 12,
                border: '1px solid var(--line, #e5e5e5)',
                borderRadius: 10,
                background: 'var(--surface, #fff)',
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: 6, ...shimmer, border: '1px solid var(--line, #e5e5e5)' }} />
              <Bar w={`${60 + ((i * 13) % 35)}%`} h={14} mb={0} />
              <Bar w={60} h={14} mb={0} />
            </div>
          ))}
        </div>
      )}

      {variant === 'detail' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 24 }}>
          <div>
            <div style={{ aspectRatio: '4/3', ...shimmer, borderRadius: 12, border: '1px solid var(--line, #e5e5e5)', marginBottom: 16 }} />
            <Bar w="70%" h={28} mb={10} />
            <Bar w="45%" h={14} mb={4} />
            <Bar w="55%" h={14} mb={4} />
          </div>
          <div>
            <Bar w={180} h={20} mb={12} />
            {Array.from({ length: 6 }).map((_, i) => (
              <Bar key={i} w={`${60 + ((i * 11) % 35)}%`} h={16} mb={10} />
            ))}
          </div>
        </div>
      )}

      {variant === 'form' && (
        <div style={{ maxWidth: 640 }}>
          <Bar w="35%" h={26} mb={20} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <Bar w={110 + (i * 7) % 60} h={12} mb={8} />
              <Bar w="100%" h={40} r={8} mb={0} />
            </div>
          ))}
        </div>
      )}

      {variant === 'plain' && (
        <div>
          <Bar w="30%" h={24} mb={16} />
          <Bar w="90%" h={14} />
          <Bar w="85%" h={14} />
          <Bar w="60%" h={14} mb={0} />
        </div>
      )}
    </div>
  )
}
