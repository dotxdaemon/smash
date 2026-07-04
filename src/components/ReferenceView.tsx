// ABOUTME: Renders the Seraph Notes quick-review sheet within the tracker.
// ABOUTME: Presents supplied Palutena training notes without affecting saved sets.
import {
  SERAPH_NOTES,
  SERAPH_NOTES_SUBTITLE,
  SERAPH_NOTES_SUMMARY,
  SMASH_FUNDAMENTALS_REMINDER,
  SMASH_PEOPLE_NOTES,
} from '../data/seraphNotes'

export function ReferenceView() {
  return (
    <section className="reference" aria-labelledby="seraph-notes-title">
      <header className="reference-header">
        <p className="reference-subtitle">{SERAPH_NOTES_SUBTITLE}</p>
        <h2 id="seraph-notes-title" className="reference-title">
          Seraph Notes
        </h2>
        <p className="reference-summary">{SERAPH_NOTES_SUMMARY}</p>
      </header>

      <div className="reference-list">
        <section className="reference-note" aria-labelledby="people-notes-title">
          <h3 id="people-notes-title" className="reference-note-title">
            Playing against other people
          </h3>
          <ul className="reference-points">
            {SMASH_PEOPLE_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>

        <section
          className="reference-note"
          aria-labelledby="smash-fundamentals-title"
        >
          <h3 id="smash-fundamentals-title" className="reference-note-title">
            Smash Fundamentals
          </h3>
          <p className="reference-focus">{SMASH_FUNDAMENTALS_REMINDER}</p>
        </section>
      </div>

      <ol className="reference-list">
        {SERAPH_NOTES.map((note, index) => (
          <li key={note.title} className="reference-note">
            <h3 className="reference-note-title">
              <span className="reference-number" aria-hidden="true">
                {index + 1}.
              </span>
              {note.title}
            </h3>
            <p className="reference-focus">
              <strong>Focus:</strong> {note.focus}
            </p>
            <ul className="reference-points">
              {note.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
