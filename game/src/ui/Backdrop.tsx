/** Floating doodles behind the game. Decorative only. */
const SHAPES = [
  { k: 'q', x: 6, y: 12, s: 46, d: 0, c: 'var(--sun)' },
  { k: 'star', x: 88, y: 8, s: 34, d: 2, c: 'var(--coral)' },
  { k: 'ring', x: 92, y: 62, s: 52, d: 4, c: 'var(--sky)' },
  { k: 'q', x: 80, y: 88, s: 38, d: 1, c: 'var(--grape)' },
  { k: 'blob', x: 4, y: 70, s: 56, d: 3, c: 'var(--mint)' },
  { k: 'star', x: 14, y: 92, s: 26, d: 5, c: 'var(--sun)' },
  { k: 'ring', x: 50, y: 4, s: 22, d: 2.5, c: 'var(--mint)' },
]

function Shape({ k, c }: { k: string; c: string }) {
  switch (k) {
    case 'q':
      return (
        <text x="50" y="78" textAnchor="middle" fontSize="88" fontWeight="700" fill={c} fontFamily="Fredoka Variable, sans-serif">
          ?
        </text>
      )
    case 'star':
      return <path d="M50 6 L62 38 L96 40 L69 61 L79 94 L50 75 L21 94 L31 61 L4 40 L38 38 Z" fill={c} />
    case 'ring':
      return <circle cx="50" cy="50" r="36" fill="none" stroke={c} strokeWidth="14" />
    default:
      return <path d="M50 8 C80 8 94 30 90 56 C86 84 64 94 44 90 C20 86 6 66 10 42 C14 20 30 8 50 8 Z" fill={c} />
  }
}

export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      {SHAPES.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 100 100"
          width={s.s}
          height={s.s}
          style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `-${s.d}s` }}
        >
          <Shape k={s.k} c={s.c} />
        </svg>
      ))}
    </div>
  )
}
