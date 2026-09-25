import { STATS_KEY, STORAGE_KEY, type RaceSnapshot, type RaceStats } from './types'

const PHASES = new Set(['idle', 'armed', 'racing', 'paused', 'resolved', 'cooldown'])
const PACK_IDS = new Set(['short', 'medium', 'long'])

function isSnapshot(value: unknown): value is RaceSnapshot {
  if (!value || typeof value !== 'object') return false
  const s = value as Partial<RaceSnapshot>
  if (!PHASES.has(s.phase as string) || !PACK_IDS.has(s.packId as string)) return false
  if (!Array.isArray(s.board)) return false
  if ((s.phase === 'racing' || s.phase === 'paused') && s.board.length === 0) return false
  return true
}

export function loadSnapshot(): RaceSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isSnapshot(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveSnapshot(snapshot: RaceSnapshot): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // quota / private mode — ignore
  }
}

export function clearSnapshot(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export const EMPTY_STATS: RaceStats = { player: 0, agent: 0, lastResolvedAt: null }

export function loadStats(): RaceStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return EMPTY_STATS
    const parsed = JSON.parse(raw) as Partial<RaceStats>
    return {
      player: Number(parsed.player) || 0,
      agent: Number(parsed.agent) || 0,
      lastResolvedAt: typeof parsed.lastResolvedAt === 'number' ? parsed.lastResolvedAt : null,
    }
  } catch {
    return EMPTY_STATS
  }
}

export function saveStats(stats: RaceStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {
    // ignore
  }
}

export function isStorageAvailable(): boolean {
  try {
    const probe = `${STORAGE_KEY}:probe`
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}
