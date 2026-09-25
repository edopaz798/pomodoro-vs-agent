export type Phase = 'idle' | 'armed' | 'racing' | 'paused' | 'resolved' | 'cooldown'
export type PackId = 'short' | 'medium' | 'long'
export type Winner = 'player' | 'agent'

/** Cell color index 0..n-1, or null for empty */
export type Cell = number | null
export type Board = Cell[][] // [row][col], row 0 = top

export interface Pack {
  id: PackId
  label: string
  description: string
  rows: number
  cols: number
  colors: number
  rounds: number
}

export interface RaceSnapshot {
  phase: Phase
  packId: PackId
  taskLabel: string
  board: Board
  round: number
  /** Wall-clock ms when race started (Go pressed) */
  raceStartedAt: number | null
  /** Player wall-clock finish (board cleared) */
  playerFinishedAt: number | null
  /** Agent wall-clock finish (honor-system button) */
  agentFinishedAt: number | null
  /** Accumulated player run time (excludes paused) before current segment */
  playerElapsedMs: number
  /** When current running segment started; null if paused / not racing */
  runSegmentStartedAt: number | null
  pauseStartedAt: number | null
  winner: Winner | null
  playerTimeMs: number | null
  agentTimeMs: number | null
  resolvedAt: number | null
  cooldownEndsAt: number | null
}

export const STORAGE_KEY = 'pomodoro-vs-agent:v1'
export const TIE_WINDOW_MS = 1000
export const COOLDOWN_MS = 3000

export const COLOR_PALETTE = [
  '#ff6b6b',
  '#4ecdc4',
  '#ffe66d',
  '#a78bfa',
  '#74b9ff',
] as const
