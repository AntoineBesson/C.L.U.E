import { useState } from 'react'
import { ITEMS } from '../items'
import { availablePacks, packItems, RANDOM_PACK, type Pack } from '../packs'
import { getSeenIds, getStreak } from '../storage'
import { asOf, dayOf, doneToday } from '../streak'
import { Mascot } from '../ui/Mascot'
import { sfx } from '../ui/sound'

/** Home screen: pick a pack (a theme or the random mix), then solo or a pass-and-play room. */
export function Menu({ initialPack, onSolo, onRoom }: {
  initialPack: Pack
  onSolo: (pack: Pack) => void
  onRoom: (pack: Pack) => void
}) {
  const [pack, setPack] = useState<Pack>(initialPack)
  const [seen] = useState(getSeenIds)
  const [streak] = useState(() => {
    const today = dayOf(new Date())
    const s = asOf(getStreak(), today)
    return { ...s, today: doneToday(s, today) }
  })
  const left = (p: Pack) => packItems(p, ITEMS).filter((i) => !seen.has(i.id)).length

  return (
    <main>
      <div className="panel menu">
        <div className="hero">
          <Mascot mood="happy" size={80} />
          <div>
            <h1>Pick your dilemmas</h1>
            <p className="tagline">Choose a theme, or let chance decide.</p>
          </div>
        </div>

        <StreakBadge current={streak.current} best={streak.best} today={streak.today} />

        <div className="packs" role="radiogroup" aria-label="Question pack">
          {availablePacks(ITEMS).map((p) => {
            const n = left(p)
            return (
              <button
                key={p.id}
                role="radio"
                aria-checked={pack.id === p.id}
                className={`pack${pack.id === p.id ? ' selected' : ''}${p.id === RANDOM_PACK.id ? ' random' : ''}`}
                onClick={() => {
                  sfx.pop()
                  setPack(p)
                }}
              >
                <span className="pack-emoji" aria-hidden="true">
                  {p.emoji}
                </span>
                <span className="pack-label">{p.label}</span>
                <span className="pack-blurb">{p.blurb}</span>
                <span className="pack-left">{n === 0 ? 'all played' : `${n} new`}</span>
              </button>
            )
          })}
        </div>

        <div className="menu-actions">
          <button className="primary big" onClick={() => onSolo(pack)}>
            Play solo
          </button>
          <button className="big room-btn" onClick={() => onRoom(pack)}>
            Pass-and-play room
            <small>Friends on one phone</small>
          </button>
        </div>
      </div>
    </main>
  )
}

function StreakBadge({ current, best, today }: { current: number; best: number; today: boolean }) {
  if (current === 0) {
    return (
      <div className="streak-badge">
        <span className="flame" aria-hidden="true">🕯️</span>
        <span>
          <strong>Start a streak</strong>
          <small>{best > 1 ? `Your best: ${best} days in a row. ` : ''}Play a solo set every day to build it.</small>
        </span>
      </div>
    )
  }
  return (
    <div className={today ? 'streak-badge on' : 'streak-badge'}>
      <span className="flame" aria-hidden="true">🔥</span>
      <span>
        <strong>
          {current}-day streak{current >= best && current > 1 ? ' (your best!)' : ''}
        </strong>
        <small>{today ? 'Done for today. See you tomorrow!' : `Play today to make it ${current + 1}.`}</small>
      </span>
    </div>
  )
}
