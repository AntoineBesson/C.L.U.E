import { useState } from 'react'
import { CONFIG } from '../config'
import type { Consent } from '../types'

export function ConsentScreen({ onAccept }: { onAccept: (c: Consent) => void }) {
  const [adult, setAdult] = useState(false)
  const [research, setResearch] = useState(false)
  const [tracking, setTracking] = useState(false)

  return (
    <main>
      <div className="panel consent">
      <h1>C.L.U.E.</h1>
      <p className="lede">
        A short research game about everyday dilemmas. Before you play, here is exactly what it records.
      </p>

      <h2>What this game studies</h2>
      <p>
        This game is part of a research project on how much a few answers reveal about a person. At the end we
        show you what your answers suggest about you. Your answers are never scored as right or wrong.
      </p>

      <h2>What is recorded</h2>
      <ul>
        <li>Your answers to each dilemma, and the order the options were shown in.</li>
        <li>
          Whether an &ldquo;Are you sure?&rdquo; question was shown and whether you changed your answer. This
          prompt appears on some cards at random; it does not mean your answer was unusual.
        </li>
        <li>A random player code, kept in this browser. No name, email, account, IP address or device fingerprint.</li>
      </ul>

      <h2>Where it goes</h2>
      <p>
        In this prototype, everything stays in this browser. Nothing is sent to a server. You can export or delete
        your data at any time from the end screen.
      </p>

      <label className="check">
        <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
        <span>I am 18 or older.</span>
      </label>
      <label className="check">
        <input type="checkbox" checked={research} onChange={(e) => setResearch(e.target.checked)} />
        <span>
          I agree that my answers are recorded for this research, knowing they may reveal my opinions and values.
        </span>
      </label>

      <fieldset className="optin">
        <legend>Optional: hesitation tracking</legend>
        <p>
          If you agree, the game also notes <strong>how</strong> you reached each answer, as a few numbers per
          card: how long before your first click, how many times you changed your answer, how many characters you
          typed and deleted, how far the slider and mouse moved, and whether you left the tab.
        </p>
        <p>
          It never records which keys you pressed, your typing rhythm, or your mouse path, and these numbers are
          not used to recognise you. You can play fully without this.
        </p>
        <label className="check">
          <input type="checkbox" checked={tracking} onChange={(e) => setTracking(e.target.checked)} />
          <span>Yes, record my hesitation signals too.</span>
        </label>
      </fieldset>

      <button
        className="primary"
        disabled={!adult || !research}
        onClick={() =>
          onAccept({
            version: CONFIG.consentVersion,
            givenAt: new Date().toISOString(),
            adult: true,
            research: true,
            uncertaintyTracking: tracking,
          })
        }
      >
        Start playing
      </button>
      </div>
    </main>
  )
}
