import { useEffect, useState } from 'react'
import { PACKS } from '../game/packs'
import type { RaceSnapshot } from '../game/types'
import { BoardGrid } from './Board'
import { Clock } from './Clock'

interface RacingScreenProps {
  state: RaceSnapshot
  getPlayerElapsed: (now?: number) => number
  getAgentElapsed: (now?: number) => number
  onTap: (row: number, col: number) => void
  onPlayerCleared: () => void
  onAgentDone: () => void
  onPause: () => void
  onResume: () => void
  onExit: () => void
}

export function RacingScreen({
  state,
  getPlayerElapsed,
  getAgentElapsed,
  onTap,
  onPlayerCleared,
  onAgentDone,
  onPause,
  onResume,
  onExit,
}: RacingScreenProps) {
  const [, setTick] = useState(0)
  const paused = state.phase === 'paused'
  const pack = PACKS[state.packId]
  const playerDone = state.playerFinishedAt !== null
  const agentDone = state.agentFinishedAt !== null

  useEffect(() => {
    if (paused && playerDone) return
    // Keep ticking while either clock still runs
    const bothDone = playerDone && agentDone
    if (bothDone) return
    const id = window.setInterval(() => setTick((t) => t + 1), 100)
    return () => clearInterval(id)
  }, [paused, playerDone, agentDone])

  const now = Date.now()
  const playerMs = getPlayerElapsed(now)
  const agentMs = getAgentElapsed(now)

  return (
    <section className="screen screen--racing">
      <header className="race-header">
        <div className="race-meta">
          <span className="pill">{pack.label}</span>
          {pack.rounds > 1 && (
            <span className="pill pill--muted">
              Round {state.round}/{pack.rounds}
            </span>
          )}
          {state.taskLabel && <span className="task-chip">{state.taskLabel}</span>}
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onExit}>
          Exit
        </button>
      </header>

      <div className="clocks">
        <Clock
          label="You"
          ms={playerMs}
          accent="you"
          done={playerDone}
          paused={paused && !playerDone}
        />
        <div className="clocks__vs">vs</div>
        <Clock label="Agent" ms={agentMs} accent="agent" done={agentDone} />
      </div>

      <BoardGrid
        board={state.board}
        disabled={paused || playerDone}
        onTap={onTap}
      />

      <div className="race-actions">
        {!paused ? (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onPause}
            disabled={playerDone}
          >
            Pause
          </button>
        ) : (
          <button type="button" className="btn btn--secondary" onClick={onResume}>
            Resume
          </button>
        )}
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onPlayerCleared}
          disabled={playerDone}
        >
          I cleared it
        </button>
        <button
          type="button"
          className="btn btn--agent"
          onClick={onAgentDone}
          disabled={agentDone}
        >
          Agent done
        </button>
      </div>

      <p className="hint">
        Tap groups of 2+ same-color tiles. Agent done is honor-system — hit it when
        the agent finishes.
      </p>
    </section>
  )
}
