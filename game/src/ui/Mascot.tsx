/** "Clu", the game's original mascot: a round blob with a question-curl antenna. */
export type Mood = 'idle' | 'curious' | 'unsure' | 'happy'

const MOUTHS: Record<Mood, string> = {
  idle: 'M52 74 Q60 80 68 74',
  curious: 'M55 75 Q60 79 65 75',
  unsure: 'M50 77 Q55 72 60 77 Q65 82 70 76',
  happy: 'M48 70 Q60 88 72 70 Z',
}

export function Mascot({ mood = 'idle', size = 96 }: { mood?: Mood; size?: number }) {
  return (
    <svg
      className={`mascot mascot-${mood}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden="true"
    >
      {/* antenna */}
      <path
        className="mascot-antenna"
        d="M60 22 Q60 10 70 8 Q80 7 79 16 Q78 23 70 23"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="70" cy="23" r="5" fill="var(--sun)" stroke="var(--ink)" strokeWidth="3" />
      {/* body */}
      <path
        d="M60 26 C92 26 106 48 104 74 C102 100 84 110 60 110 C36 110 18 100 16 74 C14 48 28 26 60 26 Z"
        fill="var(--mint)"
        stroke="var(--ink)"
        strokeWidth="4"
      />
      <ellipse cx="44" cy="42" rx="10" ry="6" fill="#fff" opacity="0.45" transform="rotate(-25 44 42)" />
      {/* cheeks */}
      <ellipse cx="34" cy="74" rx="7" ry="4" fill="var(--coral)" opacity="0.55" />
      <ellipse cx="86" cy="74" rx="7" ry="4" fill="var(--coral)" opacity="0.55" />
      {/* brows */}
      {mood === 'unsure' && (
        <g stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round">
          <path d="M38 46 L50 50" />
          <path d="M82 44 L70 48" />
        </g>
      )}
      {mood === 'curious' && (
        <g stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round">
          <path d="M38 47 Q44 42 50 46" />
        </g>
      )}
      {/* eyes */}
      <g className="mascot-eyes">
        {mood === 'happy' ? (
          <g fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round">
            <path d="M38 60 Q44 52 50 60" />
            <path d="M70 60 Q76 52 82 60" />
          </g>
        ) : (
          <>
            <ellipse cx="44" cy="60" rx="8" ry="10" fill="#fff" stroke="var(--ink)" strokeWidth="3" />
            <ellipse cx="76" cy="60" rx="8" ry="10" fill="#fff" stroke="var(--ink)" strokeWidth="3" />
            <circle className="mascot-pupil" cx={mood === 'unsure' ? 42 : 46} cy="62" r="4" fill="var(--ink)" />
            <circle className="mascot-pupil" cx={mood === 'unsure' ? 74 : 78} cy="62" r="4" fill="var(--ink)" />
          </>
        )}
      </g>
      <path
        d={MOUTHS[mood]}
        fill={mood === 'happy' ? 'var(--ink)' : 'none'}
        stroke="var(--ink)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
