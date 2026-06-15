// ABOUTME: Renders the set logging, history, and matchup stats app shell.
// ABOUTME: Keeps the tracker focused on quick entry and recent performance review.
import { type FormEvent, useMemo, useState } from 'react'
import { CHARACTERS } from './data/characters'
import { loadSets, saveSets } from './lib/storage'
import {
  getMatchupSummary,
  getNextSetFocus,
  LOSS_TAGS,
  type MatchupSummary,
} from './lib/training'
import type { LossTag, SetEntry } from './types'

type View = 'log' | 'history' | 'stats'

const VIEWS: View[] = ['log', 'history', 'stats']
const PLAYER_CHARACTER = 'Palutena'

type SetEntryInput = {
  opponent: string
  result: 'win' | 'loss'
  notes: string
  lossTags: LossTag[]
}

function calcStreak(sets: SetEntry[]): { result: 'win' | 'loss'; count: number } | null {
  if (sets.length === 0) return null
  const sorted = [...sets].sort((a, b) => b.date.localeCompare(a.date))
  const current = sorted[0].result
  let count = 0
  for (const set of sorted) {
    if (set.result !== current) break
    count++
  }
  return { result: current, count }
}

function createSetEntry({
  opponent,
  result,
  notes,
  lossTags,
}: SetEntryInput): SetEntry {
  const entry: SetEntry = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    opponent: opponent.trim(),
    yourCharacter: PLAYER_CHARACTER,
    result,
    notes: notes.trim() || undefined,
  }

  if (result === 'loss' && lossTags.length > 0) {
    entry.lossTags = [...lossTags]
  }

  return entry
}

function App() {
  const [sets, setSets] = useState(loadSets)
  const [view, setView] = useState<View>('log')

  const [opponent, setOpponent] = useState('')
  const [result, setResult] = useState<'win' | 'loss'>('win')
  const [notes, setNotes] = useState('')
  const [lossTags, setLossTags] = useState<LossTag[]>([])
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null)

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
  const streak = useMemo(() => calcStreak(sets), [sets])
  const nextFocus = useMemo(() => getNextSetFocus(sortedSets), [sortedSets])
  const matchup = useMemo(
    () => (selectedOpponent ? getMatchupSummary(sets, selectedOpponent) : null),
    [selectedOpponent, sets],
  )

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!opponent.trim()) return

    const entry = createSetEntry({ opponent, result, notes, lossTags })

    const next = [entry, ...sets]
    setSets(next)
    saveSets(next)
    setOpponent('')
    setNotes('')
    setLossTags([])
  }

  function deleteSet(id: string) {
    const next = sets.filter((s) => s.id !== id)
    setSets(next)
    saveSets(next)
  }

  function selectView(nextView: View) {
    setView(nextView)
    if (nextView !== 'history') setSelectedOpponent(null)
  }

  function toggleLossTag(tag: LossTag) {
    setLossTags((current) =>
      current.includes(tag)
        ? current.filter((selectedTag) => selectedTag !== tag)
        : [...current, tag],
    )
  }

  function openMatchup(nextOpponent: string) {
    setSelectedOpponent(nextOpponent)
    setView('history')
  }

  function exportData() {
    const json = JSON.stringify(sets, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `smash-tracker-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      data-visual-system="training-ledger"
      data-layout="compact-workspace"
      className="app-shell"
    >
      <div className="app-frame">
        <header className="app-header">
          <div>
            <h1 className="app-title">Smash Tracker</h1>
            <p className="app-status">
              {sets.length === 0
                ? 'Log your first set.'
                : `${sets.length} sets · ${totalWins}W ${totalLosses}L`}
              {streak && streak.count >= 2 && (
                <span className={`streak-pill is-${streak.result}`}>
                  {streak.count}{streak.result === 'win' ? 'W' : 'L'} streak
                </span>
              )}
            </p>
          </div>
          {sets.length > 0 && (
            <button type="button" className="export-action" onClick={exportData}>
              Export
            </button>
          )}
        </header>

        <nav aria-label="Views" className="view-tabs">
          {VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              className={`view-tab ${view === v ? 'is-active' : ''}`}
              onClick={() => selectView(v)}
            >
              {v === 'log' ? 'Log Set' : v === 'history' ? 'History' : 'Stats'}
            </button>
          ))}
        </nav>

        <main className="workspace" data-matchup-pages="history-opponents">
          {view === 'log' && (
            <form className="log-form" onSubmit={onSubmit}>
              <section aria-label="Next set focus" className="focus-panel">
                <span className="focus-kicker">
                  {nextFocus.tagLabel ?? nextFocus.title}
                </span>
                <p className="focus-copy">{nextFocus.detail}</p>
              </section>

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
                  <span className="character-value">{PLAYER_CHARACTER}</span>
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

              {result === 'loss' && (
                <fieldset className="tag-fieldset">
                  <legend>Loss tags</legend>
                  <div className="tag-options">
                    {LOSS_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        aria-pressed={lossTags.includes(tag.id)}
                        className={`tag-button ${
                          lossTags.includes(tag.id) ? 'is-active' : ''
                        }`}
                        onClick={() => toggleLossTag(tag.id)}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

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

              {sortedSets.length > 0 && (
                <section className="recent-log">
                  <p className="recent-log-label">Recent</p>
                  <ul className="recent-log-list">
                    {sortedSets.slice(0, 3).map((set) => (
                      <li key={set.id} className="recent-log-row">
                        <span className={`result-mark is-${set.result}`}>
                          {set.result === 'win' ? 'W' : 'L'}
                        </span>
                        <button
                          type="button"
                          className="opponent-link"
                          onClick={() => openMatchup(set.opponent)}
                        >
                          vs {set.opponent}
                        </button>
                        <span className="recent-log-date">{formatDate(set.date)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </form>
          )}

          {view === 'history' && (
            <div>
              {matchup ? (
                <MatchupPanel
                  matchup={matchup}
                  onBack={() => setSelectedOpponent(null)}
                  onDelete={deleteSet}
                />
              ) : sortedSets.length === 0 ? (
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
                          <button
                            type="button"
                            className="opponent-link"
                            onClick={() => openMatchup(set.opponent)}
                          >
                            vs {set.opponent}
                          </button>
                        </div>
                        <span className="set-date">{formatDate(set.date)}</span>
                      </div>
                      <p className="set-meta">Playing {PLAYER_CHARACTER}</p>
                      {set.lossTags && set.lossTags.length > 0 && (
                        <div className="set-tags">
                          {set.lossTags.map((tag) => (
                            <span key={tag} className="loss-tag-badge">
                              {labelForLossTag(tag)}
                            </span>
                          ))}
                        </div>
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
                      <div className="stat-main">
                        <button
                          type="button"
                          className="stat-name"
                          onClick={() => openMatchup(s.name)}
                        >
                          {s.name}
                        </button>
                        <div className="stat-record">
                          <span className="wins">{s.wins}W</span>
                          <span className="losses">{s.losses}L</span>
                          <span className="rate">
                            {s.total > 0
                              ? `${Math.round((s.wins / s.total) * 100)}%`
                              : '–'}
                          </span>
                        </div>
                      </div>
                      {s.total > 0 && (
                        <div className="win-rate-bar">
                          <div
                            className="win-rate-fill"
                            style={{ width: `${Math.round((s.wins / s.total) * 100)}%` }}
                          />
                        </div>
                      )}
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

function MatchupPanel({
  matchup,
  onBack,
  onDelete,
}: {
  matchup: MatchupSummary
  onBack: () => void
  onDelete: (id: string) => void
}) {
  const rate =
    matchup.total > 0 ? `${Math.round((matchup.wins / matchup.total) * 100)}%` : '–'

  return (
    <section className="matchup-panel">
      <button type="button" className="back-action" onClick={onBack}>
        ← Back to history
      </button>

      <header className="matchup-header">
        <div>
          <h2>Palutena vs {matchup.opponent}</h2>
          <p>
            {matchup.total} sets · {matchup.wins}W {matchup.losses}L · {rate}
          </p>
        </div>
      </header>

      {matchup.total > 0 && (
        <div className="matchup-rate-bar">
          <div
            className="win-rate-fill"
            style={{ width: `${Math.round((matchup.wins / matchup.total) * 100)}%` }}
          />
        </div>
      )}

      <section className="matchup-card">
        <h3>Next focus</h3>
        <p>{matchup.focus.detail}</p>
      </section>

      <section className="matchup-card">
        <h3>Common loss tags</h3>
        {matchup.commonLossTags.length === 0 ? (
          <p className="empty-copy">No tagged losses yet.</p>
        ) : (
          <ul className="tag-summary-list">
            {matchup.commonLossTags.map((tag) => (
              <li key={tag.id}>
                <span>{tag.label}</span>
                <span>{tag.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="matchup-card">
        <h3>Useful notes</h3>
        {matchup.notes.length === 0 ? (
          <p className="empty-copy">No notes for this matchup yet.</p>
        ) : (
          <ul className="note-list">
            {matchup.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="matchup-card">
        <h3>Last 5 sets</h3>
        <ul className="set-list">
          {matchup.recentSets.map((set) => (
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
              {set.lossTags && set.lossTags.length > 0 && (
                <div className="set-tags">
                  {set.lossTags.map((tag) => (
                    <span key={tag} className="loss-tag-badge">
                      {labelForLossTag(tag)}
                    </span>
                  ))}
                </div>
              )}
              {set.notes && <p className="set-notes">{set.notes}</p>}
              <button
                type="button"
                className="delete-action"
                onClick={() => onDelete(set.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </section>
  )
}

function labelForLossTag(tag: LossTag): string {
  return LOSS_TAGS.find((item) => item.id === tag)?.label ?? tag
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
