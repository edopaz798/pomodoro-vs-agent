interface IdleScreenProps {
  onStart: () => void
}

export function IdleScreen({ onStart }: IdleScreenProps) {
  return (
    <section className="screen screen--idle">
      <div className="hero">
        <p className="eyebrow">wait-time arena</p>
        <h1 className="title">Pomodoro vs Agent</h1>
        <p className="subtitle">
          Race your Cursor agent while you wait. Clear a Stack Rush color grid
          before you mark the agent done.
        </p>
      </div>
      <button type="button" className="btn btn--primary btn--lg" onClick={onStart}>
        Start wait
      </button>
      <p className="hint">SameGame-style · honor-system Agent done · local only</p>
    </section>
  )
}
