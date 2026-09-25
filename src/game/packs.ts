import type { Pack, PackId } from './types'

export const PACKS: Record<PackId, Pack> = {
  short: {
    id: 'short',
    label: 'Short',
    description: '5×5 · 3 colors · 1 board',
    rows: 5,
    cols: 5,
    colors: 3,
    rounds: 1,
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    description: '6×6 · 4 colors · 1 board',
    rows: 6,
    cols: 6,
    colors: 4,
    rounds: 1,
  },
  long: {
    id: 'long',
    label: 'Long',
    description: '6×6 · 4 colors · 2 boards',
    rows: 6,
    cols: 6,
    colors: 4,
    rounds: 2,
  },
}

export const PACK_LIST: Pack[] = [PACKS.short, PACKS.medium, PACKS.long]
