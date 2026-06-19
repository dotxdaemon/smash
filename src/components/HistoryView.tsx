// ABOUTME: Lists logged sets with opponent search and result filtering.
// ABOUTME: Falls back to an empty state when nothing has been logged yet.
import { useState } from 'react'
import { filterSets, type ResultFilter } from '../lib/sets'
import { EmptyState } from './EmptyState'
import { SetList } from './SetList'
import type { SetEntry } from '../types'

const RESULT_FILTERS: ReadonlyArray<{ id: ResultFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'win', label: 'Wins' },
  { id: 'loss', label: 'Losses' },
]

type HistoryViewProps = {
  sets: SetEntry[]
  onOpenOpponent: (opponent: string) => void
  onDelete: (id: string) => void
  onLog: () => void
}

export function HistoryView({
  sets,
  onOpenOpponent,
  onDelete,
  onLog,
}: HistoryViewProps) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<ResultFilter>('all')

  if (sets.length === 0) {
    return (
      <EmptyState
        glyph="戦"
        title="No sets yet"
        text="Log your first set to start building your record and matchup notes."
        actionLabel="Log a set"
        onAction={onLog}
      />
    )
  }

  const filtered = filterSets(sets, { query, result })

  return (
    <div>
      <div className="history-controls">
        <input
          type="search"
          className="search-field"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search opponent"
          aria-label="Search by opponent"
        />
        <div className="segmented" role="group" aria-label="Filter by result">
          {RESULT_FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={result === option.id}
              className={`segment is-${option.id} ${result === option.id ? 'is-active' : ''}`}
              onClick={() => setResult(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite">
        {filtered.length === 0 ? (
          <p className="empty-copy">No sets match your filters.</p>
        ) : (
          <SetList
            sets={filtered}
            onOpenOpponent={onOpenOpponent}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  )
}
