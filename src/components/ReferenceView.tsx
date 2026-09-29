// ABOUTME: Renders the reference notes list within the tracker.
// ABOUTME: Presents supplied notes without affecting saved sets.
import { REFERENCE_NOTES } from '../data/referenceNotes'

export function ReferenceView() {
  return (
    <section className="reference" aria-labelledby="reference-title">
      <header className="reference-header">
        <h2 id="reference-title" className="reference-title">
          Reference
        </h2>
      </header>

      <ol className="reference-list">
        {REFERENCE_NOTES.map((note, index) => (
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
