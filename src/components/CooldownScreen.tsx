import { useEffect, useState } from 'react'
import { COOLDOWN_MS } from '../game/types'

interface CooldownScreenProps {
  endsAt: number | null
}

export function CooldownScreen({ endsAt }: CooldownScreenProps) {
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

  return (
    <section className="screen screen--cooldown">
      <p className="eyebrow">cooldown</p>
      <h2 className="title title--sm">Nice race</h2>
      <p className="subtitle">Back to idle in {sec}s…</p>
      <div className="cooldown-bar">
        <div
          className="cooldown-bar__fill"
          style={{
            width: `${Math.max(0, Math.min(100, (1 - left / COOLDOWN_MS) * 100))}%`,
          }}
        />
      </div>
    </section>
  )
}
