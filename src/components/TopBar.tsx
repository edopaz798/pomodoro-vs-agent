import type { Phase } from '../game/types'

const STEPS = [
  { key: 'setup', label: 'Set up' },
  { key: 'race', label: 'Race' },
  { key: 'result', label: 'Result' },
] as const

function stepFor(phase: Phase): (typeof STEPS)[number]['key'] | null {
  if (phase === 'armed') return 'setup'
  if (phase === 'racing' || phase === 'paused') return 'race'
  if (phase === 'resolved' || phase === 'cooldown') return 'result'
  return null
}

export function TopBar({ phase }: { phase: Phase }) {
  const current = stepFor(phase)
  const currentIndex = STEPS.findIndex((s) => s.key === current)

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__mark" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="brand__name">
          Stack Rush
          <small>Pomodoro vs Agent</small>
        </span>
      </div>
      {current && (
        <ol className="steps" aria-label="Progress">
          {STEPS.map((step, i) => (
            <li
              key={step.key}
              className={`steps__item${i === currentIndex ? ' steps__item--current' : ''}${
                i < currentIndex ? ' steps__item--done' : ''
              }`}
              aria-current={i === currentIndex ? 'step' : undefined}
            >
              {step.label}
            </li>
          ))}
        </ol>
      )}
    </header>
  )
}
