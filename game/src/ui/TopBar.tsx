import { useEffect, useState } from 'react'
import { isMuted, onMutedChange, setMuted } from './sound'

export function Logo() {
  return (
    <span className="logo" aria-label="C.L.U.E.">
      {['C', 'L', 'U', 'E'].map((l, i) => (
        <span key={l} className={`logo-tile t${i}`} aria-hidden="true">
          {l}
        </span>
      ))}
    </span>
  )
}

export function MuteButton() {
  const [muted, setM] = useState(isMuted)
  useEffect(() => onMutedChange(setM), [])
  return (
    <button
      className="icon-btn"
      aria-pressed={muted}
      aria-label={muted ? 'Sound off. Turn sound on' : 'Sound on. Turn sound off'}
      title={muted ? 'Sound off' : 'Sound on'}
      onClick={() => setMuted(!muted)}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {muted ? (
          <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        ) : (
          <path
            d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  )
}

/** Progress as a row of pips, current one bouncing. */
export function Progress({ index, total }: { index: number; total: number }) {
  return (
    <div className="pips" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={index + 1} aria-label={`Card ${index + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < index ? 'pip done' : i === index ? 'pip now' : 'pip'} />
      ))}
      <span className="pips-label">
        {index + 1}/{total}
      </span>
    </div>
  )
}

export function TopBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="topbar">
      <Logo />
      <div className="topbar-mid">{children}</div>
      <MuteButton />
    </header>
  )
}
