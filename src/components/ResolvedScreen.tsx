import { formatMs } from '../game/resolve'
import { PACKS } from '../game/packs'
import { TIE_WINDOW_MS, type RaceSnapshot, type RaceStats } from '../game/types'

interface ResolvedScreenProps {
  state: RaceSnapshot
  stats: RaceStats
  onRematch: () => void
  onDone: () => void
}

const PAUSE_NOTE_MIN_MS = 500

export function ResolvedScreen({ state, stats, onRematch, onDone }: ResolvedScreenProps) {
  const youWin = state.winner === 'player'
  const { playerTimeMs: playerMs, agentTimeMs: agentMs } = state
  const forfeit = playerMs === null
  const pack = PACKS[state.packId]

  const margin =
    state.playerFinishedAt !== null && state.agentFinishedAt !== null
      ? Math.abs(state.playerFinishedAt - state.agentFinishedAt)
      : null
  const photoFinish = !youWin && margin !== null && margin <= TIE_WINDOW_MS
  const pausedMs =
    state.playerFinishedAt !== null && state.raceStartedAt !== null && playerMs !== null
      ? state.playerFinishedAt - state.raceStartedAt - playerMs
      : 0

  let eyebrow: string
  let title: string
  let detail: string
  if (forfeit) {
    eyebrow = 'Forfeit'
    title = 'Agent wins'
    detail = 'Giving up mid-race counts as a win for the agent.'
  } else if (youWin) {
    eyebrow = 'Board cleared first'
    title = 'You beat the agent'
    detail = margin !== null ? `You finished ${formatMs(margin)} ahead.` : 'Nice clear.'
  } else if (photoFinish) {
    eyebrow = 'Photo finish'
    title = 'Agent takes it'
    detail = `Only ${formatMs(margin ?? 0)} apart. Finishes within 1s go to the agent.`
  } else {
    eyebrow = 'Agent finished first'
    title = 'Agent wins'
    detail =
      margin !== null
        ? `The agent was ${formatMs(margin)} ahead.${pack.id !== 'short' ? ' Try a shorter pack?' : ''}`
        : 'The agent got there first.'
  }

  return (
    <section className="screen screen--resolved">
      <div
        className={`winner-card${youWin ? ' winner-card--you' : ' winner-card--agent'}`}
        role="status"
      >
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="winner-card__title">{title}</h2>
        <p className="winner-card__detail">{detail}</p>
        {state.taskLabel && (
          <p className="task-chip task-chip--center" title={state.taskLabel}>
            {state.taskLabel}
          </p>
        )}

        <div className="winner-card__times">
          <div className={`time-cell time-cell--you${youWin ? ' time-cell--win' : ''}`}>
            <span>You</span>
            <strong>{playerMs !== null ? formatMs(playerMs) : 'Forfeit'}</strong>
          </div>
          <div className={`time-cell time-cell--agent${!youWin ? ' time-cell--win' : ''}`}>
            <span>Agent</span>
            <strong>{agentMs !== null ? formatMs(agentMs) : '—'}</strong>
          </div>
        </div>

        {pausedMs >= PAUSE_NOTE_MIN_MS && (
          <p className="winner-card__note">
            Your clock excludes {formatMs(pausedMs)} of pause. The winner is whoever finished first
            in real time.
          </p>
        )}

        <p className="record record--inline" aria-label="Your record">
          Record <strong className="record__you">{stats.player}</strong>
          <span aria-hidden> – </span>
          <strong className="record__agent">{stats.agent}</strong>
        </p>
      </div>

      <div className="result-actions">
        <button type="button" className="btn btn--primary btn--lg" onClick={onRematch}>
          Rematch
        </button>
        <button type="button" className="btn btn--quiet btn--lg" onClick={onDone}>
          Done
        </button>
      </div>
    </section>
  )
}
