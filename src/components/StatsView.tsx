// ABOUTME: Shows loss habits plus per-opponent records with win-rate bars.
// ABOUTME: Falls back to an empty state until sets have been logged.
import { EmptyState } from './EmptyState'
import { formatWinRate } from '../lib/format'
import type { OpponentRecord } from '../lib/stats'
import type { LossHabit } from '../lib/training'

type StatsViewProps = {
  records: OpponentRecord[]
  habits: LossHabit[]
  onOpenOpponent: (opponent: string) => void
  onLog: () => void
}

export function StatsView({ records, habits, onOpenOpponent, onLog }: StatsViewProps) {
  if (records.length === 0) {
    return (
      <EmptyState
        title="No stats yet"
        text="Your win rate and matchup breakdown appear here once you log sets."
        actionLabel="Log a set"
        onAction={onLog}
      />
    )
  }

  return (
    <div>
      {habits.length > 0 && (
        <section className="habit-strip" aria-label="Most common loss habits">
          <h2 className="habit-title">Loss habits</h2>
          <ul className="habit-list">
            {habits.slice(0, 3).map((habit) => (
              <li key={habit.id} className="habit-row">
                <span className="habit-label">{habit.label}</span>
                <span className="habit-count">
                  ×{habit.total}
                  {habit.recent > 0 && (
                    <span className="habit-recent"> · {habit.recent} in last 10</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ul className="stats-list">
        {records.map((record) => {
          const percent =
            record.winRate === null ? null : Math.round(record.winRate * 100)
          return (
            <li key={record.name} className="stat-row">
              <div className="stat-head">
                <button
                  type="button"
                  className="stat-name"
                  onClick={() => onOpenOpponent(record.name)}
                >
                  {record.name}
                </button>
                <div className="stat-record">
                  <span className="wins">{record.wins}W</span>
                  <span className="losses">{record.losses}L</span>
                  <span className="rate">{formatWinRate(record.winRate)}</span>
                </div>
              </div>
              <div
                className="stat-bar"
                role="img"
                aria-label={`${record.wins} wins, ${record.losses} losses${
                  percent === null ? '' : `, ${percent} percent win rate`
                }`}
              >
                <span className="stat-bar-fill" style={{ width: `${percent ?? 0}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
