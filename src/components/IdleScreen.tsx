import type { RaceStats } from '../game/types'

interface IdleScreenProps {
  stats: RaceStats
  onStart: () => void
  onResetStats: () => void
}

const HOW_IT_WORKS = [
  { title: 'Send your prompt', body: 'Kick off a Cursor agent, then hit Start wait here.' },
  { title: 'Clear the grid', body: 'Tap groups of 2+ matching tiles until the board is empty.' },
  { title: 'Call the finish', body: 'Tap Agent done the moment your agent wraps up.' },
]

export function IdleScreen({ stats, onStart, onResetStats }: IdleScreenProps) {
  const played = stats.player + stats.agent

  return (
    <section className="screen screen--idle">
      <div className="hero">
        <p className="eyebrow">Wait-time arena</p>
        <h1 className="title">
          Beat your agent <span className="title__accent">to the finish.</span>
        </h1>
        <p className="subtitle">
          Your Cursor agent is working. Clear a color grid before it's done.
        </p>
      </div>

      <ol className="how">
        {HOW_IT_WORKS.map((step, i) => (
          <li key={step.title} className="how__step">
            <span className="how__num" aria-hidden>
              {i + 1}
            </span>
            <span>
              <strong>{step.title}</strong>
              <span className="how__body">{step.body}</span>
            </span>
          </li>
        ))}
      </ol>

      <button type="button" className="btn btn--primary btn--lg" onClick={onStart}>
        Start wait
      </button>

      {played > 0 ? (
        <div className="record" aria-label="Your record">
          <span className="record__side record__side--you">
            <strong>{stats.player}</strong> You
          </span>
          <span className="record__sep" aria-hidden>
            –
          </span>
          <span className="record__side record__side--agent">
            Agent <strong>{stats.agent}</strong>
          </span>
          <button type="button" className="link-btn" onClick={onResetStats}>
            Reset
          </button>
        </div>
      ) : (
        <p className="hint">No account needed. First finish wins; ties within 1s go to the agent.</p>
      )}
    </section>
  )
}
