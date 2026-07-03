// ABOUTME: Captures a new set with opponent, result, optional loss tags, and notes.
// ABOUTME: Validates the opponent inline and hands a completed input to the caller.
import { useId, useRef, useState, type FormEvent } from 'react'
import { CHARACTERS } from '../data/characters'
import { LOSS_TAGS, type TrainingFocus } from '../lib/training'
import { PLAYER_CHARACTER, type SetEntryInput } from '../lib/sets'
import type { LossTag } from '../types'

type LogFormProps = {
  focus: TrainingFocus
  onSubmit: (input: SetEntryInput) => void
  onOpenNotes: () => void
}

export function LogForm({ focus, onSubmit, onOpenNotes }: LogFormProps) {
  const [opponent, setOpponent] = useState('')
  const [result, setResult] = useState<'win' | 'loss'>('win')
  const [notes, setNotes] = useState('')
  const [lossTags, setLossTags] = useState<LossTag[]>([])
  const [error, setError] = useState<string | null>(null)
  const opponentRef = useRef<HTMLInputElement>(null)
  const errorId = useId()
  const charactersId = useId()

  function toggleTag(tag: LossTag) {
    setLossTags((current) =>
      current.includes(tag)
        ? current.filter((selected) => selected !== tag)
        : [...current, tag],
    )
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!opponent.trim()) {
      setError('Enter an opponent to log this set.')
      opponentRef.current?.focus()
      return
    }

    onSubmit({ opponent, result, notes, lossTags })
    setOpponent('')
    setNotes('')
    setLossTags([])
    setResult('win')
    setError(null)
    opponentRef.current?.focus()
  }

  return (
    <form className="log-form" onSubmit={handleSubmit} noValidate>
      <section aria-label="Next set focus" className="focus-panel">
        <span className="focus-kicker">{focus.tagLabel ?? 'Next set focus'}</span>
        <p className="focus-copy">{focus.detail}</p>
        {focus.drills && focus.drills.length > 0 && (
          <div className="focus-drills">
            <span className="focus-drills-label">Drills</span>
            {focus.drills.map((drill) => (
              <button
                key={drill.title}
                type="button"
                className="focus-drill"
                onClick={onOpenNotes}
                aria-label={`Open Seraph Notes: ${drill.title}`}
              >
                {drill.title} <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="field-pair">
        <label className="field-label">
          <span>Opponent</span>
          <input
            ref={opponentRef}
            className="field"
            list={charactersId}
            value={opponent}
            onChange={(event) => {
              setOpponent(event.target.value)
              if (error) setError(null)
            }}
            placeholder="e.g. Fox"
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          />
          {error && (
            <span id={errorId} className="field-error" role="alert">
              {error}
            </span>
          )}
        </label>

        <div className="field-label">
          <span>Your character</span>
          <span className="player-static">{PLAYER_CHARACTER}</span>
        </div>
      </div>

      <fieldset>
        <legend className="control-legend">Result</legend>
        <div className="result-toggle">
          <button
            type="button"
            aria-pressed={result === 'win'}
            className={`toggle-option is-win ${result === 'win' ? 'is-active' : ''}`}
            onClick={() => setResult('win')}
          >
            Win
          </button>
          <button
            type="button"
            aria-pressed={result === 'loss'}
            className={`toggle-option is-loss ${result === 'loss' ? 'is-active' : ''}`}
            onClick={() => setResult('loss')}
          >
            Loss
          </button>
        </div>
      </fieldset>

      {result === 'loss' && (
        <fieldset>
          <legend className="control-legend">Loss tags</legend>
          <div className="tag-grid">
            {LOSS_TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                aria-pressed={lossTags.includes(tag.id)}
                className={`tag-chip ${lossTags.includes(tag.id) ? 'is-active' : ''}`}
                onClick={() => toggleTag(tag.id)}
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
          onChange={(event) => setNotes(event.target.value)}
          placeholder="What happened? What to remember?"
          rows={3}
        />
      </label>

      <button type="submit" className="submit-action">
        Save set
      </button>

      <datalist id={charactersId}>
        {CHARACTERS.map((character) => (
          <option key={character} value={character} />
        ))}
      </datalist>
    </form>
  )
}
