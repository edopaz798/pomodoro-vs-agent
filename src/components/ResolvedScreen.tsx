import { formatDelta, formatMs } from '../game/resolve'
import type { RaceSnapshot } from '../game/types'

interface ResolvedScreenProps {
  state: RaceSnapshot
  onRematch: () => void
  onDone: () => void
}

export function ResolvedScreen({ state, onRematch, onDone }: ResolvedScreenProps) {
  const youWin = state.winner === 'player'
  const playerMs = state.playerTimeMs
  const agentMs = state.agentTimeMs

  return (
    <section className="screen screen--resolved">
      <div className={`winner-card${youWin ? ' winner-card--you' : ' winner-card--agent'}`}>
        <p className="eyebrow">{youWin ? 'clear!' : 'agent edges it'}</p>
        <h2 className="winner-card__title">{youWin ? 'You win' : 'Agent wins'}</h2>
        {state.taskLabel && <p className="task-chip">{state.taskLabel}</p>}

        <div className="winner-card__times">
          <div>
            <span className="muted">You</span>
            <strong>{playerMs !== null ? formatMs(playerMs) : '—'}</strong>
          </div>
          <div>
            <span className="muted">Agent</span>
            <strong>{agentMs !== null ? formatMs(agentMs) : '—'}</strong>
          </div>
        </div>

        {playerMs !== null && agentMs !== null && (
          <p className="delta">
            Δ {formatDelta(playerMs, agentMs)}
            {Math.abs(playerMs - agentMs) <= 1000 && (
              <span className="muted"> · within 1s → agent</span>
            )}
          </p>
        )}

        {playerMs === null && (
          <p className="muted">Forfeit — exiting mid-race counts as agent win.</p>
        )}
      </div>

      <div className="race-actions">
        <button type="button" className="btn btn--primary" onClick={onRematch}>
          Rematch
        </button>
        <button type="button" className="btn btn--secondary" onClick={onDone}>
          Done
        </button>
      </div>
    </section>
  )
}
