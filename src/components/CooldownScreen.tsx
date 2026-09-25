import { useEffect, useState } from 'react'
import { COOLDOWN_MS } from '../game/types'

interface CooldownScreenProps {
  endsAt: number | null
  onSkip: () => void
}

const RING_RADIUS = 34
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

export function CooldownScreen({ endsAt, onSkip }: CooldownScreenProps) {
  const [left, setLeft] = useState(() =>
    endsAt ? Math.max(0, endsAt - Date.now()) : COOLDOWN_MS,
  )

  useEffect(() => {
    const id = window.setInterval(() => {
      setLeft(endsAt ? Math.max(0, endsAt - Date.now()) : 0)
    }, 100)
    return () => clearInterval(id)
  }, [endsAt])

  const sec = Math.ceil(left / 1000)
  const fraction = Math.max(0, Math.min(1, left / COOLDOWN_MS))

  return (
    <section className="screen screen--cooldown">
      <div className="cooldown-ring" aria-hidden>
        <svg viewBox="0 0 80 80">
          <circle className="cooldown-ring__track" cx="40" cy="40" r={RING_RADIUS} />
          <circle
            className="cooldown-ring__fill"
            cx="40"
            cy="40"
            r={RING_RADIUS}
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - fraction)}
          />
        </svg>
        <span className="cooldown-ring__num">{sec}</span>
      </div>
      <div className="hero hero--tight">
        <h2 className="title title--sm">Nice race</h2>
        <p className="subtitle" role="status">
          Back to the start in {sec}s. Take a breath before the next prompt.
        </p>
      </div>
      <button type="button" className="btn btn--ghost" onClick={onSkip}>
        Skip
      </button>
    </section>
  )
}
