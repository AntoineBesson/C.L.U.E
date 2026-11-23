import { useState } from 'react'

const COLORS = ['var(--sun)', 'var(--coral)', 'var(--sky)', 'var(--mint)', 'var(--grape)']

/** One-shot CSS confetti burst. Decorative only. */
export function Confetti({ count = 60 }: { count?: number }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      dur: 1.8 + Math.random() * 1.6,
      rot: Math.random() * 720 - 360,
      drift: Math.random() * 160 - 80,
      color: COLORS[i % COLORS.length],
      round: Math.random() < 0.35,
    })),
  )
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i
          key={i}
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              borderRadius: p.round ? '50%' : '2px',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              '--rot': `${p.rot}deg`,
              '--drift': `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
