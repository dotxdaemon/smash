// ABOUTME: Renders the Notion Smash notes as a dedicated quick-reference page.
// ABOUTME: Presents people reminders and fundamentals apart from Seraph drills.
import {
  SMASH_FUNDAMENTALS_REMINDER,
  SMASH_PEOPLE_NOTES,
} from '../data/smashNotes'

export function NotesView() {
  return (
    <section className="reference" aria-labelledby="smash-notes-title">
      <header className="reference-header">
        <h2 id="smash-notes-title" className="reference-title">
          Smash!
        </h2>
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
    </section>
  )
}
