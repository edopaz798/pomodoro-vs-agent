import { useMemo, useState } from 'react'
import { findGroup } from '../game/board'
import { COLOR_PALETTE, type Board as BoardType } from '../game/types'

interface BoardProps {
  board: BoardType
  disabled?: boolean
  onTap: (row: number, col: number) => void
}

const COLOR_NAMES = ['coral', 'amber', 'sky', 'lime', 'pink']

export function BoardGrid({ board, disabled, onTap }: BoardProps) {
  const rows = board.length
  const cols = board[0]?.length ?? 0
  const [hover, setHover] = useState<[number, number] | null>(null)

  const highlight = useMemo(() => {
    if (!hover || disabled) return new Set<string>()
    const [r, c] = hover
    const group = findGroup(board, r, c)
    if (group.length < 2) return new Set<string>()
    return new Set(group.map(([gr, gc]) => `${gr},${gc}`))
  }, [board, hover, disabled])

  return (
    <div
      className={`board${disabled ? ' board--disabled' : ''}`}
      role="group"
      aria-label="Stack Rush board"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
      onPointerLeave={() => setHover(null)}
    >
      {board.map((row, r) =>
        row.map((cell, c) => {
          const key = `${r},${c}`
          const lit = highlight.has(key)
          const empty = cell === null
          const colorIndex = empty ? -1 : cell % COLOR_PALETTE.length
          return (
            <button
              key={key}
              type="button"
              className={`tile${empty ? ' tile--empty' : ''}${lit ? ' tile--lit' : ''}`}
              data-color={empty ? undefined : colorIndex}
              style={empty ? undefined : { backgroundColor: COLOR_PALETTE[colorIndex] }}
              disabled={disabled || empty}
              aria-label={empty ? 'empty' : `${COLOR_NAMES[colorIndex]} tile, row ${r + 1}, column ${c + 1}`}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') setHover([r, c])
              }}
              onFocus={() => setHover([r, c])}
              onClick={() => onTap(r, c)}
            />
          )
        }),
      )}
    </div>
  )
}
