import { TIE_WINDOW_MS, type Winner } from './types'

/**
 * First timestamp wins. Within TIE_WINDOW_MS → agent wins.
 * Missing player finish (forfeit) → agent wins.
 */
export function decideWinner(
  playerFinishedAt: number | null,
  agentFinishedAt: number | null,
): Winner {
  if (playerFinishedAt === null) return 'agent'
  if (agentFinishedAt === null) return 'player'

  const delta = Math.abs(playerFinishedAt - agentFinishedAt)
  if (delta <= TIE_WINDOW_MS) return 'agent'
  return playerFinishedAt < agentFinishedAt ? 'player' : 'agent'
}

export function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  const tenths = Math.floor((ms % 1000) / 100)
  if (m > 0) {
    return `${m}:${s.toString().padStart(2, '0')}.${tenths}`
  }
  return `${s}.${tenths}s`
}

export function formatDelta(playerMs: number, agentMs: number): string {
  const d = Math.abs(playerMs - agentMs)
  const sign = playerMs < agentMs ? '−' : '+'
  return `${sign}${formatMs(d)}`
}
