import { useEffect, useRef, useState } from 'react'
import { hasMoves } from '../game/board'
import { PACKS } from '../game/packs'
import { formatMs } from '../game/resolve'
import type { RaceSnapshot } from '../game/types'
import { BoardGrid } from './Board'
import { Clock } from './Clock'

interface RacingScreenProps {
  state: RaceSnapshot
  restored: boolean
  getPlayerElapsed: (now?: number) => number
  getAgentElapsed: (now?: number) => number
  onTap: (row: number, col: number) => void
  onPlayerCleared: () => void
  onAgentDone: () => void
  onPause: () => void
  onResume: () => void
  onExit: () => void
}

type Tone = 'info' | 'you' | 'agent' | 'warn'

const BASE_TITLE = 'Pomodoro vs Agent · Stack Rush'
const CONFIRM_MS = 3000
const FLASH_MS = 2500

function useFlash(trigger: unknown, initial: boolean): boolean {
  const [on, setOn] = useState(initial)
  const prev = useRef(trigger)
  useEffect(() => {
    if (prev.current === trigger) return
    prev.current = trigger
    setOn(true)
  }, [trigger])
  useEffect(() => {
    if (!on) return
    const id = window.setTimeout(() => setOn(false), FLASH_MS)
    return () => clearTimeout(id)
  }, [on])
  return on
}

export function RacingScreen({
  state,
  restored,
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
  const [confirmExit, setConfirmExit] = useState(false)
  const paused = state.phase === 'paused'
  const pack = PACKS[state.packId]
  const playerDone = state.playerFinishedAt !== null
  const agentDone = state.agentFinishedAt !== null
  const showRestored = useFlash('restored', restored)
  const showNewRound = useFlash(state.round, false) && state.round > 1

  useEffect(() => {
    if (paused && playerDone) return
    const bothDone = playerDone && agentDone
    if (bothDone) return
    const id = window.setInterval(() => setTick((t) => t + 1), 100)
    return () => clearInterval(id)
  }, [paused, playerDone, agentDone])

  useEffect(() => {
    if (!confirmExit) return
    const id = window.setTimeout(() => setConfirmExit(false), CONFIRM_MS)
    return () => clearTimeout(id)
  }, [confirmExit])

  const handlers = useRef({ paused, onAgentDone, onPause, onResume })
  useEffect(() => {
    handlers.current = { paused, onAgentDone, onPause, onResume }
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.isContentEditable)) return
      const key = e.key.toLowerCase()
      if (key === 'a') handlers.current.onAgentDone()
      if (key === 'p') {
        if (handlers.current.paused) handlers.current.onResume()
        else handlers.current.onPause()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const now = Date.now()
  const playerMs = getPlayerElapsed(now)
  const agentMs = getAgentElapsed(now)

  useEffect(() => {
    const mark = paused ? '⏸' : '▶'
    document.title = `${mark} ${formatMs(playerMs)} vs ${formatMs(agentMs)} · Stack Rush`
  })
  useEffect(() => () => void (document.title = BASE_TITLE), [])

  const tilesLeft = state.board.reduce(
    (sum, row) => sum + row.filter((c) => c !== null).length,
    0,
  )
  const tilesPerBoard = pack.rows * pack.cols
  const totalTiles = tilesPerBoard * pack.rounds
  const cleared = playerDone
    ? totalTiles
    : (state.round - 1) * tilesPerBoard + (tilesPerBoard - tilesLeft)
  const progress = Math.round((cleared / totalTiles) * 100)
  const stuck = !playerDone && tilesLeft > 0 && !hasMoves(state.board)

  let tone: Tone = 'info'
  let message: string
  if (playerDone && !agentDone) {
    tone = 'you'
    message = `Your clock stopped at ${formatMs(playerMs)}. Tap Agent done when your agent finishes.`
  } else if (agentDone && !playerDone) {
    tone = 'agent'
    message = 'The agent finished first and takes this round. Finish your board to see the result.'
  } else if (stuck) {
    tone = 'warn'
    message = 'No moves left. Tap Stop my clock to lock in your time.'
  } else if (showNewRound) {
    tone = 'you'
    message = `Board ${state.round - 1} cleared, ${pack.rounds - state.round + 1} to go.`
  } else if (showRestored) {
    message = 'Race restored after refresh. Your clock kept its time.'
  } else {
    message = 'Tap a group of 2+ matching tiles. Tiles fall down and empty columns slide left.'
  }

  return (
    <section className="screen screen--racing">
      <header className="race-header">
        <div className="race-meta">
          <span className="pill">{pack.label}</span>
          {pack.rounds > 1 && (
            <span className="pill pill--muted">
              Board {state.round}/{pack.rounds}
            </span>
          )}
          {state.taskLabel && (
            <span className="task-chip" title={state.taskLabel}>
              {state.taskLabel}
            </span>
          )}
        </div>
        <button
          type="button"
          className={`btn btn--sm ${confirmExit ? 'btn--danger' : 'btn--ghost'}`}
          onClick={() => (confirmExit ? onExit() : setConfirmExit(true))}
        >
          {confirmExit ? 'Tap again to forfeit' : 'Give up'}
        </button>
      </header>

      <div className="race-layout">
        <div className="clocks">
          <Clock
            label="You"
            ms={playerMs}
            accent="you"
            status={playerDone ? 'done' : paused ? 'paused' : 'running'}
          />
          <div className="clocks__vs" aria-hidden>
            vs
          </div>
          <Clock
            label="Agent"
            ms={agentMs}
            accent="agent"
            status={agentDone ? 'done' : 'running'}
          />
        </div>

        <p className={`status status--${tone}`} role="status" aria-live="polite">
          {message}
        </p>

        <div className="race-board">
          <div className="board-wrap">
            <BoardGrid board={state.board} disabled={paused || playerDone} onTap={onTap} />
            {paused && (
              <div className="board-overlay">
                <p className="board-overlay__title">Paused</p>
                <p className="board-overlay__body">
                  Your clock is frozen. The agent's keeps running.
                </p>
                <button type="button" className="btn btn--secondary" onClick={onResume}>
                  Resume
                </button>
              </div>
            )}
            {playerDone && (
              <div className="board-overlay board-overlay--done">
                <p className="board-overlay__title">Board cleared</p>
                <p className="board-overlay__body">{formatMs(playerMs)}</p>
              </div>
            )}
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-label="Tiles cleared"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="progress__track">
              <div className="progress__fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress__label">
              {playerDone ? 'Done' : `${tilesLeft} tiles left`}
            </span>
          </div>
        </div>

        <div className="race-actions">
          <button
            type="button"
            className={`btn btn--agent btn--lg${playerDone && !agentDone ? ' btn--pulse' : ''}`}
            onClick={onAgentDone}
            disabled={agentDone}
          >
            {agentDone ? 'Agent finished ✓' : 'Agent done'}
            <kbd>A</kbd>
          </button>
          <div className="race-actions__row">
            {!paused ? (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={onPause}
                disabled={playerDone}
              >
                Pause
                <kbd>P</kbd>
              </button>
            ) : (
              <button type="button" className="btn btn--secondary" onClick={onResume}>
                Resume
                <kbd>P</kbd>
              </button>
            )}
            <button
              type="button"
              className={`btn ${stuck ? 'btn--warn' : 'btn--quiet'}`}
              onClick={onPlayerCleared}
              disabled={playerDone}
              title="Stops your clock now, as if you cleared the board"
            >
              Stop my clock
            </button>
          </div>
          <p className="hint hint--left">
            Honor system: tap <strong>Agent done</strong> the moment Cursor finishes. Pause only
            freezes your clock.
          </p>
        </div>
      </div>
    </section>
  )
}
