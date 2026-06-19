// ABOUTME: Shows the overall win/loss record, win rate, and recent-form pips.
// ABOUTME: Reads aggregated records and stays free of set-storage concerns.
import { formatWinRate } from '../lib/format'
import type { WinLossRecord } from '../lib/stats'

type ScoreboardProps = {
  record: WinLossRecord
  form: Array<'win' | 'loss'>
}

export function Scoreboard({ record, form }: ScoreboardProps) {
  const rate = formatWinRate(record.winRate)
  const formLabel = form
    .map((result) => (result === 'win' ? 'win' : 'loss'))
    .join(', ')

  return (
    <div className="scoreboard">
      <div className="score-figure">
        <span className="score-value">
          {record.wins}–{record.losses}
        </span>
        <span className="score-label">Record</span>
      </div>
      <div className="score-figure">
        <span className="score-value is-rate">{rate}</span>
        <span className="score-label">Win rate</span>
      </div>
      {form.length > 0 && (
        <div className="score-figure">
          <div
            className="form-pips"
            role="img"
            aria-label={`Recent form, most recent first: ${formLabel}`}
          >
            {form.map((result, index) => (
              <span key={index} className={`form-pip is-${result}`} aria-hidden="true" />
            ))}
          </div>
          <span className="score-label">Last {form.length}</span>
        </div>
      )}
    </div>
  )
}
