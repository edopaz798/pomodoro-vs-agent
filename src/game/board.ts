import type { Board, Cell, Pack } from './types'

/** Create a fresh random board for a pack. Avoids all-isolated tiles when possible. */
export function createBoard(pack: Pack, rng: () => number = Math.random): Board {
  const { rows, cols, colors } = pack
  const fill = (): Board =>
    Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.floor(rng() * colors)),
    )

  let board = fill()
  for (let attempt = 0; attempt < 20 && !hasMoves(board); attempt++) {
    board = fill()
  }
  return board
}

export function emptyBoard(board: Board): Board {
  return board.map((row) => row.map(() => null))
}

/** True when the board is fully clear, or only isolated tiles remain. */
export function isBoardSettled(board: Board): boolean {
  return isBoardEmpty(board) || !hasMoves(board)
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

export function isBoardEmpty(board: Board): boolean {
  return board.every((row) => row.every((c) => c === null))
}

/** BFS for orthogonally connected same-color group starting at (r,c). */
export function findGroup(board: Board, r: number, c: number): [number, number][] {
  const color = board[r]?.[c]
  if (color === null || color === undefined) return []

  const rows = board.length
  const cols = board[0]?.length ?? 0
  const visited = new Set<string>()
  const group: [number, number][] = []
  const queue: [number, number][] = [[r, c]]
  visited.add(`${r},${c}`)

  const dirs: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]

  while (queue.length) {
    const [cr, cc] = queue.shift()!
    group.push([cr, cc])
    for (const [dr, dc] of dirs) {
      const nr = cr + dr
      const nc = cc + dc
      const key = `${nr},${nc}`
      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        !visited.has(key) &&
        board[nr][nc] === color
      ) {
        visited.add(key)
        queue.push([nr, nc])
      }
    }
  }

  return group
}

/** Clear a group (size >= 2), apply gravity down, pack columns left. Returns new board. */
export function clearGroup(board: Board, group: [number, number][]): Board {
  if (group.length < 2) return board

  const next = cloneBoard(board)
  for (const [r, c] of group) {
    next[r][c] = null
  }

  return packColumns(applyGravity(next))
}

/** Tiles fall down within each column. */
function applyGravity(board: Board): Board {
  const rows = board.length
  const cols = board[0]?.length ?? 0
  const next: Board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null as Cell),
  )

  for (let c = 0; c < cols; c++) {
    const stack: number[] = []
    for (let r = rows - 1; r >= 0; r--) {
      const cell = board[r][c]
      if (cell !== null) stack.push(cell)
    }
    let write = rows - 1
    for (const color of stack) {
      next[write][c] = color
      write--
    }
  }
  return next
}

/** Empty columns shift left; filled columns pack to the left. */
function packColumns(board: Board): Board {
  const rows = board.length
  const cols = board[0]?.length ?? 0
  const filled: Cell[][] = []

  for (let c = 0; c < cols; c++) {
    const hasTile = board.some((row) => row[c] !== null)
    if (hasTile) {
      filled.push(board.map((row) => row[c]))
    }
  }

  const next: Board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null as Cell),
  )

  for (let i = 0; i < filled.length; i++) {
    for (let r = 0; r < rows; r++) {
      next[r][i] = filled[i][r]
    }
  }
  return next
}

/** True if any clearable group of 2+ exists. */
export function hasMoves(board: Board): boolean {
  const rows = board.length
  const cols = board[0]?.length ?? 0
  const seen = new Set<string>()

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === null) continue
      const key = `${r},${c}`
      if (seen.has(key)) continue
      const group = findGroup(board, r, c)
      for (const [gr, gc] of group) seen.add(`${gr},${gc}`)
      if (group.length >= 2) return true
    }
  }
  return false
}
