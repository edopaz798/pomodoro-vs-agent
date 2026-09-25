import { formatMs } from '../game/resolve'

interface ClockProps {
  label: string
  ms: number
  accent: 'you' | 'agent'
  done?: boolean
  paused?: boolean
}

export function Clock({ label, ms, accent, done, paused }: ClockProps) {
  return (
    <div className={`clock clock--${accent}${done ? ' clock--done' : ''}${paused ? ' clock--paused' : ''}`}>
      <span className="clock__label">{label}</span>
      <span className="clock__time">{formatMs(ms)}</span>
      {done && <span className="clock__badge">done</span>}
      {paused && !done && <span className="clock__badge">paused</span>}
    </div>
  )
}
