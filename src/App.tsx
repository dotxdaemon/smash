import { type FormEvent, useMemo, useState } from 'react'
import { CHARACTERS } from './data/characters'
import { loadSets, saveSets } from './lib/storage'
import type { SetEntry } from './types'

type View = 'log' | 'history' | 'stats'

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
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-24 pt-6">
      <header className="mb-6">
        <h1 className="font-display text-3xl text-ink">Smash Tracker</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {sets.length === 0
            ? 'Log your first set.'
            : `${sets.length} sets \u00b7 ${totalWins}W ${totalLosses}L`}
        </p>
      </header>

      <nav className="mb-6 flex gap-1 rounded-xl border border-line/50 bg-paper-soft p-1">
        {(['log', 'history', 'stats'] as const).map((v) => (
          <button
            key={v}
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              view === v
                ? 'bg-paper-strong text-ink shadow-sm'
                : 'text-ink-faint hover:text-ink-soft'
            }`}
            onClick={() => setView(v)}
          >
            {v === 'log' ? 'Log Set' : v === 'history' ? 'History' : 'Stats'}
          </button>
        ))}
      </nav>

      {view === 'log' && (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-ink-soft">Opponent</span>
            <input
              className="field"
              list="characters"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="e.g. Fox"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink-soft">
              Your character
            </span>
            <input
              className="field"
              list="characters"
              value={yourCharacter}
              onChange={(e) => setYourCharacter(e.target.value)}
              placeholder="e.g. Wolf"
            />
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-soft">
              Result
            </legend>
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  result === 'win'
                    ? 'border-support/40 bg-support/10 text-support'
                    : 'border-line/50 text-ink-faint hover:border-line-strong'
                }`}
                onClick={() => setResult('win')}
              >
                Win
              </button>
              <button
                type="button"
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  result === 'loss'
                    ? 'border-danger/40 bg-danger/10 text-danger'
                    : 'border-line/50 text-ink-faint hover:border-line-strong'
                }`}
                onClick={() => setResult('loss')}
              >
                Loss
              </button>
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium text-ink-soft">Notes</span>
            <textarea
              className="field min-h-20 resize-y"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What happened? What to remember?"
              rows={3}
            />
          </label>

          <button
            type="submit"
            className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-paper-strong shadow-sm transition hover:bg-accent-strong"
          >
            Save Set
          </button>
        </form>
      )}

      {view === 'history' && (
        <div>
          {sortedSets.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-faint">
              No sets logged yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {sortedSets.map((set) => (
                <li
                  key={set.id}
                  className="rounded-xl border border-line/50 bg-paper-strong px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                          set.result === 'win'
                            ? 'bg-support/10 text-support'
                            : 'bg-danger/10 text-danger'
                        }`}
                      >
                        {set.result === 'win' ? 'W' : 'L'}
                      </span>
                      <span className="font-semibold text-ink">
                        vs {set.opponent}
                      </span>
                    </div>
                    <span className="text-xs text-ink-faint">
                      {formatDate(set.date)}
                    </span>
                  </div>
                  {set.yourCharacter && (
                    <p className="mt-1 text-xs text-ink-faint">
                      Playing {set.yourCharacter}
                    </p>
                  )}
                  {set.notes && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {set.notes}
                    </p>
                  )}
                  <button
                    type="button"
                    className="mt-2 text-xs text-ink-faint transition hover:text-danger"
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
            <p className="py-12 text-center text-sm text-ink-faint">
              No data yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.map((s) => (
                <li
                  key={s.name}
                  className="flex items-center justify-between rounded-xl border border-line/50 bg-paper-strong px-4 py-3"
                >
                  <span className="font-semibold text-ink">{s.name}</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-support">{s.wins}W</span>
                    <span className="text-danger">{s.losses}L</span>
                    <span className="text-ink-faint">
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
