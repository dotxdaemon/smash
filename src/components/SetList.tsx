// ABOUTME: Renders a list of logged sets with result, opponent, tags, and notes.
// ABOUTME: Shared by the history list and the matchup recent-sets card.
import { formatSetDate, labelForLossTag } from '../lib/format'
import type { SetEntry } from '../types'

type SetListProps = {
  sets: SetEntry[]
  onDelete: (id: string) => void
  onOpenOpponent?: (opponent: string) => void
}

export function SetList({ sets, onDelete, onOpenOpponent }: SetListProps) {
  return (
    <ul className="set-list">
      {sets.map((set) => (
        <li key={set.id} className={`set-row is-${set.result}`}>
          <div className="set-row-head">
            <div className="set-summary">
              <span
                className={`result-badge is-${set.result}`}
                role="img"
                aria-label={set.result === 'win' ? 'Win' : 'Loss'}
              >
                {set.result === 'win' ? 'W' : 'L'}
              </span>
              {onOpenOpponent ? (
                <button
                  type="button"
                  className="opponent-link"
                  onClick={() => onOpenOpponent(set.opponent)}
                >
                  vs {set.opponent}
                </button>
              ) : (
                <span className="set-opponent">vs {set.opponent}</span>
              )}
            </div>
            <span className="set-date">{formatSetDate(set.date)}</span>
          </div>

          {set.yourCharacter && <p className="set-meta">Playing {set.yourCharacter}</p>}

          {set.lossTags && set.lossTags.length > 0 && (
            <div className="set-tags">
              {set.lossTags.map((tag) => (
                <span key={tag} className="set-tag">
                  {labelForLossTag(tag)}
                </span>
              ))}
            </div>
          )}

          {set.notes && <p className="set-notes">{set.notes}</p>}

          <div className="set-row-foot">
            <button
              type="button"
              className="row-delete"
              onClick={() => onDelete(set.id)}
              aria-label={`Delete set versus ${set.opponent}`}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
