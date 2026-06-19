// ABOUTME: Shows one opponent's record, focus, common loss tags, notes, and recent sets.
// ABOUTME: Moves focus to the back control on open for keyboard drill-in and out.
import { useEffect, useRef } from 'react'
import { SetList } from './SetList'
import { formatWinRate } from '../lib/format'
import type { MatchupSummary } from '../lib/training'

type MatchupPanelProps = {
  matchup: MatchupSummary
  onBack: () => void
  onDelete: (id: string) => void
}

export function MatchupPanel({ matchup, onBack, onDelete }: MatchupPanelProps) {
  const backRef = useRef<HTMLButtonElement>(null)
  const winRate = matchup.total > 0 ? matchup.wins / matchup.total : null
  const rate = formatWinRate(winRate)

  useEffect(() => {
    backRef.current?.focus()
  }, [matchup.opponent])

  return (
    <section className="matchup" aria-label={`Matchup versus ${matchup.opponent}`}>
      <button ref={backRef} type="button" className="back-action" onClick={onBack}>
        ← Back to history
      </button>

      <header className="matchup-header">
        <div>
          <h2 className="matchup-title">Palutena vs {matchup.opponent}</h2>
          <p className="matchup-record">
            {matchup.total} sets · {matchup.wins}W {matchup.losses}L · {rate}
          </p>
        </div>
      </header>

      <div className="matchup-cards">
        <section className="matchup-card">
          <h3>Next focus</h3>
          <p>{matchup.focus.detail}</p>
        </section>

        <section className="matchup-card">
          <h3>Common loss tags</h3>
          {matchup.commonLossTags.length === 0 ? (
            <p className="empty-copy">No tagged losses yet.</p>
          ) : (
            <ul className="tag-summary">
              {matchup.commonLossTags.map((tag) => (
                <li key={tag.id}>
                  <span>{tag.label}</span>
                  <span className="count">{tag.count}</span>
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
          <h3>Last {matchup.recentSets.length} sets</h3>
          <SetList sets={matchup.recentSets} onDelete={onDelete} />
        </section>
      </div>
    </section>
  )
}
