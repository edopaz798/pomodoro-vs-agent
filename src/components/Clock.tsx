import { formatMs } from '../game/resolve'

export type ClockStatus = 'running' | 'paused' | 'done'

interface ClockProps {
  label: string
  ms: number
  accent: 'you' | 'agent'
  status: ClockStatus
}

const STATUS_TEXT: Record<ClockStatus, string> = {
  running: 'Running',
  paused: 'Paused',
  done: 'Finished',
}

export function Clock({ label, ms, accent, status }: ClockProps) {
  return (
    <div className={`clock clock--${accent} clock--${status}`}>
      <span className="clock__head">
        <span className="clock__label">{label}</span>
        <span className="clock__status">
          <span className="clock__dot" aria-hidden />
          {STATUS_TEXT[status]}
        </span>
      </span>
      <span className="clock__time" role="timer" aria-label={`${label} time`}>
        {formatMs(ms)}
      </span>
    </div>
  )
}
