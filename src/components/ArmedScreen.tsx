import { PACK_LIST } from '../game/packs'
import type { PackId } from '../game/types'

interface ArmedScreenProps {
  packId: PackId
  taskLabel: string
  onPack: (id: PackId) => void
  onTask: (label: string) => void
  onGo: () => void
  onBack: () => void
}

export function ArmedScreen({
  packId,
  taskLabel,
  onPack,
  onTask,
  onGo,
  onBack,
}: ArmedScreenProps) {
  return (
    <section className="screen screen--armed">
      <header className="screen__header">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Back
        </button>
        <h2>Arm the race</h2>
      </header>

      <div className="pack-grid">
        {PACK_LIST.map((pack) => (
          <button
            key={pack.id}
            type="button"
            className={`pack-card${packId === pack.id ? ' pack-card--active' : ''}`}
            onClick={() => onPack(pack.id)}
          >
            <span className="pack-card__label">{pack.label}</span>
            <span className="pack-card__desc">{pack.description}</span>
          </button>
        ))}
      </div>

      <label className="field">
        <span>Task label (optional)</span>
        <input
          type="text"
          placeholder="e.g. refactor auth middleware"
          value={taskLabel}
          maxLength={80}
          onChange={(e) => onTask(e.target.value)}
        />
      </label>

      <button type="button" className="btn btn--primary btn--lg" onClick={onGo}>
        Go
      </button>
      <p className="hint">Both clocks start when you hit Go.</p>
    </section>
  )
}
