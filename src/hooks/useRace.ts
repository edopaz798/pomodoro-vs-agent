import { useCallback, useEffect, useReducer, useRef } from 'react'
import { clearGroup, createBoard, findGroup, isBoardEmpty } from '../game/board'
import { PACKS } from '../game/packs'
import { decideWinner } from '../game/resolve'
import { clearSnapshot, loadSnapshot, saveSnapshot } from '../game/storage'
import {
  COOLDOWN_MS,
  type PackId,
  type RaceSnapshot,
} from '../game/types'

function initialIdle(): RaceSnapshot {
  return {
    phase: 'idle',
    packId: 'short',
    taskLabel: '',
    board: [],
    round: 1,
    raceStartedAt: null,
    playerFinishedAt: null,
    agentFinishedAt: null,
    playerElapsedMs: 0,
    runSegmentStartedAt: null,
    pauseStartedAt: null,
    winner: null,
    playerTimeMs: null,
    agentTimeMs: null,
    resolvedAt: null,
    cooldownEndsAt: null,
  }
}

function hydrate(): RaceSnapshot {
  const saved = loadSnapshot()
  if (!saved) return initialIdle()

  if (saved.phase === 'cooldown' && saved.cooldownEndsAt && Date.now() >= saved.cooldownEndsAt) {
    clearSnapshot()
    return initialIdle()
  }

  if (
    saved.phase === 'racing' ||
    saved.phase === 'paused' ||
    saved.phase === 'armed' ||
    saved.phase === 'resolved' ||
    saved.phase === 'cooldown'
  ) {
    // Mid-race refresh: start a fresh run segment so clock doesn't jump
    if (
      saved.phase === 'racing' &&
      saved.playerFinishedAt === null &&
      !saved.runSegmentStartedAt
    ) {
      return { ...saved, runSegmentStartedAt: Date.now() }
    }
    return {
      ...saved,
      runSegmentStartedAt: saved.runSegmentStartedAt ?? null,
    }
  }

  return initialIdle()
}

function livePlayerElapsed(state: RaceSnapshot, now: number): number {
  if (state.phase === 'paused') return state.playerElapsedMs
  if (state.playerFinishedAt !== null && state.playerTimeMs !== null) {
    return state.playerTimeMs
  }
  if (state.phase === 'racing' && state.runSegmentStartedAt !== null) {
    return state.playerElapsedMs + (now - state.runSegmentStartedAt)
  }
  return state.playerElapsedMs
}

function resolveRace(state: RaceSnapshot, now: number): RaceSnapshot {
  const winner = decideWinner(state.playerFinishedAt, state.agentFinishedAt)
  const playerTimeMs =
    state.playerFinishedAt !== null
      ? (state.playerTimeMs ?? state.playerElapsedMs)
      : null
  const agentTimeMs =
    state.agentFinishedAt !== null && state.raceStartedAt !== null
      ? state.agentFinishedAt - state.raceStartedAt
      : null

  return {
    ...state,
    phase: 'resolved',
    pauseStartedAt: null,
    runSegmentStartedAt: null,
    winner,
    playerTimeMs,
    agentTimeMs,
    resolvedAt: now,
    cooldownEndsAt: null,
  }
}

type Action =
  | { type: 'ARM' }
  | { type: 'SET_PACK'; packId: PackId }
  | { type: 'SET_TASK'; taskLabel: string }
  | { type: 'GO' }
  | { type: 'TAP'; row: number; col: number }
  | { type: 'PLAYER_CLEARED' }
  | { type: 'AGENT_DONE' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'EXIT' }
  | { type: 'REMATCH' }
  | { type: 'DONE' }
  | { type: 'IDLE' }
  | { type: 'COOLDOWN_TICK' }

function reducer(state: RaceSnapshot, action: Action): RaceSnapshot {
  const now = Date.now()

  switch (action.type) {
    case 'ARM':
      return { ...initialIdle(), phase: 'armed', packId: state.packId || 'short' }

    case 'SET_PACK':
      if (state.phase !== 'armed') return state
      return { ...state, packId: action.packId }

    case 'SET_TASK':
      if (state.phase !== 'armed') return state
      return { ...state, taskLabel: action.taskLabel }

    case 'GO': {
      if (state.phase !== 'armed') return state
      const pack = PACKS[state.packId]
      return {
        ...state,
        phase: 'racing',
        board: createBoard(pack),
        round: 1,
        raceStartedAt: now,
        playerFinishedAt: null,
        agentFinishedAt: null,
        playerElapsedMs: 0,
        runSegmentStartedAt: now,
        pauseStartedAt: null,
        winner: null,
        playerTimeMs: null,
        agentTimeMs: null,
        resolvedAt: null,
        cooldownEndsAt: null,
      }
    }

    case 'TAP': {
      if (state.phase !== 'racing') return state
      if (state.playerFinishedAt !== null) return state

      const group = findGroup(state.board, action.row, action.col)
      if (group.length < 2) return state

      const nextBoard = clearGroup(state.board, group)
      if (!isBoardEmpty(nextBoard)) {
        return { ...state, board: nextBoard }
      }

      const pack = PACKS[state.packId]
      if (state.round < pack.rounds) {
        return {
          ...state,
          board: createBoard(pack),
          round: state.round + 1,
        }
      }

      const elapsed = livePlayerElapsed(state, now)
      const withPlayer: RaceSnapshot = {
        ...state,
        board: nextBoard,
        playerFinishedAt: now,
        playerElapsedMs: elapsed,
        runSegmentStartedAt: null,
        playerTimeMs: elapsed,
      }

      if (withPlayer.agentFinishedAt !== null) {
        return resolveRace(withPlayer, now)
      }
      return withPlayer
    }

    case 'PLAYER_CLEARED': {
      if (state.phase !== 'racing' && state.phase !== 'paused') return state
      if (state.playerFinishedAt !== null) return state

      const elapsed = livePlayerElapsed(state, now)
      const withPlayer: RaceSnapshot = {
        ...state,
        phase: 'racing',
        pauseStartedAt: null,
        playerFinishedAt: now,
        playerElapsedMs: elapsed,
        runSegmentStartedAt: null,
        playerTimeMs: elapsed,
      }

      if (withPlayer.agentFinishedAt !== null) {
        return resolveRace(withPlayer, now)
      }
      return withPlayer
    }

    case 'AGENT_DONE': {
      if (state.phase !== 'racing' && state.phase !== 'paused') return state
      if (state.agentFinishedAt !== null) return state

      const withAgent: RaceSnapshot = {
        ...state,
        agentFinishedAt: now,
      }

      if (withAgent.playerFinishedAt !== null) {
        return resolveRace(withAgent, now)
      }
      return withAgent
    }

    case 'PAUSE': {
      if (state.phase !== 'racing') return state
      if (state.playerFinishedAt !== null) return state
      const elapsed = livePlayerElapsed(state, now)
      return {
        ...state,
        phase: 'paused',
        playerElapsedMs: elapsed,
        pauseStartedAt: now,
        runSegmentStartedAt: null,
      }
    }

    case 'RESUME': {
      if (state.phase !== 'paused') return state
      return {
        ...state,
        phase: 'racing',
        pauseStartedAt: null,
        runSegmentStartedAt: now,
      }
    }

    case 'EXIT': {
      if (state.phase !== 'racing' && state.phase !== 'paused') return state
      const elapsed = livePlayerElapsed(state, now)
      return resolveRace(
        {
          ...state,
          playerFinishedAt: null,
          agentFinishedAt: state.agentFinishedAt ?? now,
          playerElapsedMs: elapsed,
          playerTimeMs: null,
          runSegmentStartedAt: null,
          pauseStartedAt: null,
        },
        now,
      )
    }

    case 'REMATCH':
      return {
        ...initialIdle(),
        phase: 'armed',
        packId: state.packId,
        taskLabel: state.taskLabel,
      }

    case 'DONE':
      return {
        ...state,
        phase: 'cooldown',
        cooldownEndsAt: now + COOLDOWN_MS,
      }

    case 'IDLE':
      clearSnapshot()
      return initialIdle()

    case 'COOLDOWN_TICK':
      if (state.phase !== 'cooldown') return state
      if (state.cooldownEndsAt && now >= state.cooldownEndsAt) {
        clearSnapshot()
        return initialIdle()
      }
      return state

    default:
      return state
  }
}

export function useRace() {
  const [state, dispatch] = useReducer(reducer, undefined, hydrate)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    saveSnapshot(state)
  }, [state])

  useEffect(() => {
    if (state.phase !== 'cooldown') return
    const id = window.setInterval(() => dispatch({ type: 'COOLDOWN_TICK' }), 200)
    return () => clearInterval(id)
  }, [state.phase])

  const getPlayerElapsed = useCallback(
    (now = Date.now()) => livePlayerElapsed(stateRef.current, now),
    [],
  )

  const getAgentElapsed = useCallback((now = Date.now()) => {
    const s = stateRef.current
    if (s.raceStartedAt === null) return 0
    if (s.agentFinishedAt !== null) return s.agentFinishedAt - s.raceStartedAt
    return now - s.raceStartedAt
  }, [])

  return { state, dispatch, getPlayerElapsed, getAgentElapsed }
}
