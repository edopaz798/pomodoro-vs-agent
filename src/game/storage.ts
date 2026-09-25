import { STORAGE_KEY, type RaceSnapshot } from './types'

export function loadSnapshot(): RaceSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as RaceSnapshot
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
