// ABOUTME: Renders the set logging, history, and matchup stats app shell.
// ABOUTME: Keeps the tracker focused on quick entry and recent performance review.
import { type FormEvent, useMemo, useState } from 'react'
import { CHARACTERS } from './data/characters'
import { loadSets, saveSets } from './lib/storage'
import type { SetEntry } from './types'

type View = 'log' | 'history' | 'stats'

const VIEWS: View[] = ['log', 'history', 'stats']

function App() {
  const [sets, setSets] = useState(loadSets)
  const [view, setView] = useState<View>('log')

  const [opponent, setOpponent] = useState('')
  const [yourCharacter, setYourCharacter] = useState('')
  const [result, setResult] = useState<'win' | 'loss'>('win')
  const [notes, setNotes] = useState('')

  const sortedSets = useMemo(
    () => [...sets].sort((a, b) => b.date.localeCompare(a.date)),
    [sets],
  )

  const stats = useMemo(() => {
    const byOpponent = new Map<string, { wins: number; losses: number }>()
    for (const set of sets) {
      const record = byOpponent.get(set.opponent) ?? { wins: 0, losses: 0 }
      if (set.result === 'win') record.wins++
      else record.losses++
      byOpponent.set(set.opponent, record)
    }
    return Array.from(byOpponent.entries())
      .map(([name, record]) => ({ name, ...record, total: record.wins + record.losses }))
      .sort((a, b) => b.total - a.total)
  }, [sets])

  const totalWins = sets.filter((s) => s.result === 'win').length
  const totalLosses = sets.filter((s) => s.result === 'loss').length

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!opponent.trim()) return

    const entry: SetEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      opponent: opponent.trim(),
      yourCharacter: yourCharacter.trim() || undefined,
      result,
      notes: notes.trim() || undefined,
    }

    const next = [entry, ...sets]
    setSets(next)
    saveSets(next)
    setOpponent('')
    setNotes('')
  }

  function deleteSet(id: string) {
    const next = sets.filter((s) => s.id !== id)
    setSets(next)
    saveSets(next)
  }

  return (
    <div data-visual-system="ink-prism" className="app-shell">
      <div data-ink-stroke="true" className="ink-frame">
        <header className="app-header">
          <div>
            <h1 className="app-title">Smash Tracker</h1>
            <p className="app-status">
              {sets.length === 0
                ? 'Log your first set.'
                : `${sets.length} sets \u00b7 ${totalWins}W ${totalLosses}L`}
            </p>
          </div>
        </header>

        <nav aria-label="Views" className="view-tabs">
          {VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              className={`view-tab ${view === v ? 'is-active' : ''}`}
              onClick={() => setView(v)}
            >
              {v === 'log' ? 'Log Set' : v === 'history' ? 'History' : 'Stats'}
            </button>
          ))}
        </nav>

        <main className="workspace">
          {view === 'log' && (
            <form className="log-form" onSubmit={onSubmit}>
              <div className="field-pair">
                <label className="field-label">
                  <span>Opponent</span>
                  <input
                    className="field"
                    list="characters"
                    value={opponent}
                    onChange={(e) => setOpponent(e.target.value)}
                    placeholder="e.g. Fox"
                    required
                  />
                </label>

                <label className="field-label">
                  <span>Your character</span>
                  <input
                    className="field"
                    list="characters"
                    value={yourCharacter}
                    onChange={(e) => setYourCharacter(e.target.value)}
                    placeholder="e.g. Wolf"
                  />
                </label>
              </div>

              <fieldset className="result-fieldset">
                <legend>Result</legend>
                <div className="result-options">
                  <button
                    type="button"
                    aria-pressed={result === 'win'}
                    className={`choice-button is-win ${result === 'win' ? 'is-active' : ''}`}
                    onClick={() => setResult('win')}
                  >
                    Win
                  </button>
                  <button
                    type="button"
                    aria-pressed={result === 'loss'}
                    className={`choice-button is-loss ${result === 'loss' ? 'is-active' : ''}`}
                    onClick={() => setResult('loss')}
                  >
                    Loss
                  </button>
                </div>
              </fieldset>

              <label className="field-label">
                <span>Notes</span>
                <textarea
                  className="field notes-field"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What happened? What to remember?"
                  rows={3}
                />
              </label>

              <button type="submit" className="primary-action">
                Save Set
              </button>
            </form>
          )}

          {view === 'history' && (
            <div>
              {sortedSets.length === 0 ? (
                <p className="empty-state">No sets logged yet.</p>
              ) : (
                <ul className="set-list">
                  {sortedSets.map((set) => (
                    <li key={set.id} className="set-row">
                      <div className="set-row-header">
                        <div className="set-summary">
                          <span className={`result-mark is-${set.result}`}>
                            {set.result === 'win' ? 'W' : 'L'}
                          </span>
                          <span className="set-opponent">vs {set.opponent}</span>
                        </div>
                        <span className="set-date">{formatDate(set.date)}</span>
                      </div>
                      {set.yourCharacter && (
                        <p className="set-meta">Playing {set.yourCharacter}</p>
                      )}
                      {set.notes && <p className="set-notes">{set.notes}</p>}
                      <button
                        type="button"
                        className="delete-action"
                        onClick={() => deleteSet(set.id)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {view === 'stats' && (
            <div>
              {stats.length === 0 ? (
                <p className="empty-state">No data yet.</p>
              ) : (
                <ul className="stats-list">
                  {stats.map((s) => (
                    <li key={s.name} className="stat-row">
                      <span className="stat-name">{s.name}</span>
                      <div className="stat-record">
                        <span className="wins">{s.wins}W</span>
                        <span className="losses">{s.losses}L</span>
                        <span className="rate">
                          {s.total > 0
                            ? `${Math.round((s.wins / s.total) * 100)}%`
                            : '–'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </main>
      </div>

      <datalist id="characters">
        {CHARACTERS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default App
