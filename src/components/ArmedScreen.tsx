import type { FormEvent } from 'react'
import { PACK_LIST } from '../game/packs'
import { COLOR_PALETTE, type Pack, type PackId } from '../game/types'

interface ArmedScreenProps {
  packId: PackId
  taskLabel: string
  onPack: (id: PackId) => void
  onTask: (label: string) => void
  onGo: () => void
  onBack: () => void
}

function PackPreview({ pack }: { pack: Pack }) {
  const cells = Array.from({ length: pack.rows * pack.cols }, (_, i) => {
    const r = Math.floor(i / pack.cols)
    const c = i % pack.cols
    return COLOR_PALETTE[(r * 7 + c * 3 + ((r * c) % 3)) % pack.colors]
  })
  return (
    <span className="pack-preview" aria-hidden>
      {Array.from({ length: pack.rounds }, (_, board) => (
        <span
          key={board}
          className="pack-preview__board"
          style={{ gridTemplateColumns: `repeat(${pack.cols}, 1fr)` }}
        >
          {cells.map((color, i) => (
            <i key={i} style={{ background: color }} />
          ))}
        </span>
      ))}
    </span>
  )
}

export function ArmedScreen({
  packId,
  taskLabel,
  onPack,
  onTask,
  onGo,
  onBack,
}: ArmedScreenProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onGo()
  }

  return (
    <form className="screen screen--armed" onSubmit={handleSubmit}>
      <header className="screen__header">
        <button type="button" className="btn btn--ghost btn--sm" onClick={onBack}>
          ← Back
        </button>
        <h2>Set up the race</h2>
      </header>

      <fieldset className="pack-picker">
        <legend className="section-label">How long is the agent's task?</legend>
        <div className="pack-grid">
          {PACK_LIST.map((pack) => {
            const active = packId === pack.id
            return (
              <label key={pack.id} className={`pack-card${active ? ' pack-card--active' : ''}`}>
                <input
                  type="radio"
                  name="pack"
                  value={pack.id}
                  checked={active}
                  onChange={() => onPack(pack.id)}
                  className="visually-hidden"
                />
                <PackPreview pack={pack} />
                <span className="pack-card__text">
                  <span className="pack-card__label">{pack.label}</span>
                  <span className="pack-card__fit">{pack.fit}</span>
                  <span className="pack-card__desc">{pack.description}</span>
                </span>
                <span className="pack-card__check" aria-hidden />
              </label>
            )
          })}
        </div>
      </fieldset>

      <label className="field">
        <span className="section-label">
          What's the agent working on? <span className="muted">(optional)</span>
        </span>
        <input
          type="text"
          placeholder="e.g. refactor auth middleware"
          value={taskLabel}
          maxLength={80}
          enterKeyHint="go"
          onChange={(e) => onTask(e.target.value)}
        />
      </label>

      <div className="cta-block">
        <button type="submit" className="btn btn--primary btn--lg">
          Go — start both clocks
        </button>
        <p className="hint">Hit Go the moment you send your prompt to the agent.</p>
      </div>
    </form>
  )
}
