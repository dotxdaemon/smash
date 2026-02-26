// ABOUTME: Renders the Smash Matchup Lab MVP with keyboard-first entry and analytics views.
// ABOUTME: Connects local entry persistence, recurrence summaries, drill mapping, and filters.
import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'
import { CHARACTERS } from './data/characters'
import {
  computeWorstMatchups,
  getTodayFocus,
  summarizeMatchup,
} from './lib/analytics'
import { ALL_DRILLS } from './lib/drills'
import { createEntry, type EntryInput } from './lib/entries'
import { filterEntries, type EntryFilters } from './lib/filters'
import { loadState, saveState } from './lib/storage'
import { buildWeeklyTrend } from './lib/trends'
import {
  DEATH_CAUSE_CATEGORIES,
  SITUATION_TAGS,
  STOCK_CONTEXTS,
  type DeathCauseCategory,
  type MatchEntry,
  type SituationTag,
} from './types'

type View = 'dashboard' | 'entry' | 'matchup' | 'log' | 'drills'

const DEFAULT_DRAFT: EntryInput = {
  opponentCharacter: '',
  situationTags: [],
}

const VIEW_TITLES: Record<View, string> = {
  dashboard: 'Dashboard',
  entry: 'New Entry',
  matchup: 'Matchup',
  log: 'Entry Log',
  drills: 'Drill Library',
}

function App() {
  const [initialState] = useState(loadState)
  const [entries, setEntries] = useState<MatchEntry[]>(initialState.entries)
  const [pinnedDrills, setPinnedDrills] = useState<string[]>(
    initialState.pinnedDrills,
  )
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [selectedOpponent, setSelectedOpponent] = useState<string>('')
  const [draft, setDraft] = useState<EntryInput>(DEFAULT_DRAFT)
  const [filters, setFilters] = useState<EntryFilters>({})
  const [latestInsight, setLatestInsight] = useState<
    ReturnType<typeof summarizeMatchup> | undefined
  >()
  const [formError, setFormError] = useState<string>('')
  const [tagCursor, setTagCursor] = useState(0)
  const [currentTime] = useState(() => Date.now())

  const opponentInputRef = useRef<HTMLInputElement>(null)
  const tagPickerRef = useRef<HTMLDivElement>(null)
  const deathCauseRef = useRef<HTMLInputElement>(null)
  const whatWorkedRef = useRef<HTMLInputElement>(null)
  const ruleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    saveState({ entries, pinnedDrills })
  }, [entries, pinnedDrills])

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries],
  )

  const opponentOptions = useMemo(() => {
    const options = new Set<string>(CHARACTERS)
    for (const entry of entries) {
      options.add(entry.opponentCharacter)
    }

    return Array.from(options).sort((left, right) => left.localeCompare(right))
  }, [entries])

  const deathCauseHistory = useMemo(() => {
    const causes = new Set<string>()
    for (const entry of entries) {
      if (entry.deathCauseText) {
        causes.add(entry.deathCauseText)
      }
    }

    return Array.from(causes).sort((left, right) => left.localeCompare(right))
  }, [entries])

  const stageOptions = useMemo(() => {
    const stages = new Set<string>()
    for (const entry of entries) {
      if (entry.stage) {
        stages.add(entry.stage)
      }
    }

    return Array.from(stages).sort((left, right) => left.localeCompare(right))
  }, [entries])

  const todayFocus = useMemo(() => getTodayFocus(entries), [entries])

  const lastThirtyDaysWorst = useMemo(() => {
    const endDate = new Date(currentTime).toISOString()
    const startDate = new Date(
      currentTime - 30 * 24 * 60 * 60 * 1000,
    ).toISOString()

    return computeWorstMatchups(entries, {
      startDate,
      endDate,
      limit: 3,
    })
  }, [currentTime, entries])

  const matchupEntries = useMemo(() => {
    if (!selectedOpponent) {
      return []
    }

    return sortedEntries.filter(
      (entry) => entry.opponentCharacter === selectedOpponent,
    )
  }, [selectedOpponent, sortedEntries])

  const matchupSummary = useMemo(() => {
    if (!selectedOpponent) {
      return undefined
    }

    return summarizeMatchup(entries, selectedOpponent)
  }, [entries, selectedOpponent])

  const matchupTrend = useMemo(() => buildWeeklyTrend(matchupEntries), [matchupEntries])

  const matchupDeathCauses = useMemo(
    () => rankDeathCauseCategories(matchupEntries, 3),
    [matchupEntries],
  )

  const matchupClips = useMemo(
    () => matchupEntries.filter((entry) => Boolean(entry.clipLink)),
    [matchupEntries],
  )

  const matchupLastRule = useMemo(
    () => matchupEntries.find((entry) => entry.oneRuleNextTime)?.oneRuleNextTime,
    [matchupEntries],
  )

  const filteredEntries = useMemo(
    () => filterEntries(sortedEntries, filters),
    [filters, sortedEntries],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      const target = event.target
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      if (isTypingTarget) {
        return
      }

      const key = event.key.toLowerCase()
      if (key === 'n') {
        event.preventDefault()
        setActiveView('entry')
        focusSoon(opponentInputRef)
      }

      if (key === 'c') {
        event.preventDefault()
        setActiveView('entry')
        focusSoon(opponentInputRef)
      }

      if (key === 't') {
        event.preventDefault()
        setActiveView('entry')
        focusSoon(tagPickerRef)
      }

      if (key === 'd') {
        event.preventDefault()
        setActiveView('entry')
        focusSoon(deathCauseRef)
      }

      if (key === 'w') {
        event.preventDefault()
        setActiveView('entry')
        focusSoon(whatWorkedRef)
      }

      if (key === 'r') {
        event.preventDefault()
        setActiveView('entry')
        focusSoon(ruleRef)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function onDraftChange<K extends keyof EntryInput>(
    key: K,
    value: EntryInput[K],
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function toggleTag(tag: SituationTag) {
    setDraft((current) => {
      const hasTag = current.situationTags.includes(tag)
      const nextTags = hasTag
        ? current.situationTags.filter((currentTag) => currentTag !== tag)
        : [...current.situationTags, tag]

      return {
        ...current,
        situationTags: nextTags,
      }
    })
  }

  function onTagPickerKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      setTagCursor((current) => (current + 1) % SITUATION_TAGS.length)
      return
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      setTagCursor(
        (current) => (current + SITUATION_TAGS.length - 1) % SITUATION_TAGS.length,
      )
      return
    }

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      const tag = SITUATION_TAGS[tagCursor]
      if (tag) {
        toggleTag(tag)
      }
    }
  }

  function onSaveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    try {
      const entry = createEntry(draft)
      const nextEntries = [entry, ...entries]
      setEntries(nextEntries)

      const summary = summarizeMatchup(nextEntries, entry.opponentCharacter)
      setLatestInsight(summary)
      setSelectedOpponent(entry.opponentCharacter)

      setDraft({
        ...DEFAULT_DRAFT,
        yourCharacter: draft.yourCharacter,
      })

      focusSoon(opponentInputRef)
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to save this entry',
      )
    }
  }

  function openMatchup(opponentCharacter: string) {
    setSelectedOpponent(opponentCharacter)
    setActiveView('matchup')
  }

  function onToggleDrillPin(title: string) {
    setPinnedDrills((current) => {
      if (current.includes(title)) {
        return current.filter((item) => item !== title)
      }

      return [...current, title]
    })
  }

  return (
    <div className="app-shell">
      <header className="app-header panel animated-entry">
        <div>
          <p className="eyebrow">Smash Matchup Lab</p>
          <h1>Searchable Set Notes</h1>
          <p className="subtitle">
            Log fast, find your biggest repeat failure, and queue one drill.
          </p>
        </div>
        <div className="hotkeys">
          <span>`N` New</span>
          <span>`C` Opponent</span>
          <span>`T` Tags</span>
          <span>`D` Death</span>
          <span>`W` Worked</span>
          <span>`R` Rule</span>
          <span>`Enter` Save</span>
        </div>
      </header>

      <nav className="view-nav panel animated-entry delay-1">
        {(Object.keys(VIEW_TITLES) as View[]).map((view) => (
          <button
            key={view}
            type="button"
            className={view === activeView ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveView(view)}
          >
            {VIEW_TITLES[view]}
          </button>
        ))}
      </nav>

      <main className="view-panel panel animated-entry delay-2">
        {activeView === 'dashboard' && (
          <section className="dashboard-grid">
            <article className="panel-card focus-card">
              <h2>Today&apos;s Focus</h2>
              {todayFocus ? (
                <>
                  <p className="focus-opponent">vs {todayFocus.opponentCharacter}</p>
                  <p className="focus-rule">{todayFocus.rule}</p>
                  <button
                    type="button"
                    className="small-action"
                    onClick={() => openMatchup(todayFocus.opponentCharacter)}
                  >
                    Open Matchup
                  </button>
                </>
              ) : (
                <p className="muted">
                  Add an entry to generate your first focused rule.
                </p>
              )}
            </article>

            <article className="panel-card">
              <h2>Worst 3 Matchups (30 days)</h2>
              {lastThirtyDaysWorst.length > 0 ? (
                <ul className="compact-list">
                  {lastThirtyDaysWorst.map((item) => (
                    <li key={item.opponentCharacter}>
                      <button
                        type="button"
                        className="inline-link"
                        onClick={() => openMatchup(item.opponentCharacter)}
                      >
                        {item.opponentCharacter}
                      </button>
                      <span>{item.negativeCount} negative logs</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No negative entries in the last 30 days.</p>
              )}
            </article>

            <article className="panel-card last-five">
              <h2>Last 5 Entries</h2>
              {sortedEntries.slice(0, 5).length > 0 ? (
                <ul className="entry-list">
                  {sortedEntries.slice(0, 5).map((entry) => (
                    <li key={entry.id}>
                      <div>
                        <button
                          type="button"
                          className="inline-link"
                          onClick={() => openMatchup(entry.opponentCharacter)}
                        >
                          {entry.opponentCharacter}
                        </button>
                        <span>{formatDate(entry.date)}</span>
                      </div>
                      <p>{entry.deathCauseText ?? 'No death cause logged'}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No entries yet. Press `N` to log your last set.</p>
              )}
            </article>
          </section>
        )}

        {activeView === 'entry' && (
          <section className="entry-view">
            <form className="entry-form" onSubmit={onSaveEntry}>
              <h2>New Entry</h2>
              <p className="muted">Terminal-style quick log. Opponent is required.</p>

              <label className="command-row">
                <span className="command-key">C</span>
                <span className="command-name">opponent</span>
                <input
                  ref={opponentInputRef}
                  list="character-options"
                  value={draft.opponentCharacter}
                  onChange={(event) =>
                    onDraftChange('opponentCharacter', event.target.value)
                  }
                  placeholder="Zero Suit Samus"
                  required
                />
              </label>

              <label className="command-row">
                <span className="command-key">Y</span>
                <span className="command-name">your character</span>
                <input
                  value={draft.yourCharacter ?? ''}
                  onChange={(event) =>
                    onDraftChange('yourCharacter', event.target.value)
                  }
                  placeholder="Wolf"
                />
              </label>

              <div className="command-grid">
                <label className="command-row">
                  <span className="command-key">S</span>
                  <span className="command-name">stage</span>
                  <input
                    list="stage-options"
                    value={draft.stage ?? ''}
                    onChange={(event) => onDraftChange('stage', event.target.value)}
                    placeholder="PS2"
                  />
                </label>

                <label className="command-row">
                  <span className="command-key">K</span>
                  <span className="command-name">stock context</span>
                  <select
                    value={draft.stockContext ?? ''}
                    onChange={(event) =>
                      onDraftChange(
                        'stockContext',
                        event.target.value
                          ? (event.target.value as EntryInput['stockContext'])
                          : undefined,
                      )
                    }
                  >
                    <option value="">Not set</option>
                    {STOCK_CONTEXTS.map((context) => (
                      <option key={context} value={context}>
                        {context}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="command-row tags-label">
                <span className="command-key">T</span>
                <span className="command-name">tags (space toggles)</span>
                <div
                  ref={tagPickerRef}
                  className="tag-picker"
                  tabIndex={0}
                  onKeyDown={onTagPickerKeyDown}
                >
                  {SITUATION_TAGS.map((tag, index) => {
                    const active = draft.situationTags.includes(tag)
                    const highlighted = index === tagCursor

                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`tag-chip ${active ? 'active' : ''} ${
                          highlighted ? 'highlighted' : ''
                        }`}
                        onClick={() => toggleTag(tag)}
                        onFocus={() => setTagCursor(index)}
                        aria-pressed={active}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </label>

              <div className="command-grid">
                <label className="command-row">
                  <span className="command-key">D</span>
                  <span className="command-name">death cause</span>
                  <input
                    ref={deathCauseRef}
                    list="death-cause-history"
                    value={draft.deathCauseText ?? ''}
                    onChange={(event) =>
                      onDraftChange('deathCauseText', event.target.value)
                    }
                    placeholder="jumped from ledge into fair"
                  />
                </label>

                <label className="command-row">
                  <span className="command-key">G</span>
                  <span className="command-name">death category</span>
                  <select
                    value={draft.deathCauseCategory ?? ''}
                    onChange={(event) =>
                      onDraftChange(
                        'deathCauseCategory',
                        event.target.value
                          ? (event.target.value as DeathCauseCategory)
                          : undefined,
                      )
                    }
                  >
                    <option value="">Not set</option>
                    {DEATH_CAUSE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="command-row">
                <span className="command-key">W</span>
                <span className="command-name">what worked</span>
                <input
                  ref={whatWorkedRef}
                  value={draft.whatWorked ?? ''}
                  onChange={(event) => onDraftChange('whatWorked', event.target.value)}
                  placeholder="holding center"
                />
              </label>

              <label className="command-row">
                <span className="command-key">R</span>
                <span className="command-name">rule next set</span>
                <input
                  ref={ruleRef}
                  value={draft.oneRuleNextTime ?? ''}
                  onChange={(event) =>
                    onDraftChange('oneRuleNextTime', event.target.value)
                  }
                  placeholder="no jump from ledge unless they commit"
                />
              </label>

              <div className="command-grid">
                <label className="command-row">
                  <span className="command-key">L</span>
                  <span className="command-name">clip link</span>
                  <input
                    value={draft.clipLink ?? ''}
                    onChange={(event) => onDraftChange('clipLink', event.target.value)}
                    placeholder="https://..."
                  />
                </label>

                <label className="command-row">
                  <span className="command-key">F</span>
                  <span className="command-name">confidence</span>
                  <select
                    value={draft.confidence ?? ''}
                    onChange={(event) =>
                      onDraftChange(
                        'confidence',
                        event.target.value
                          ? (Number(event.target.value) as 1 | 2 | 3)
                          : undefined,
                      )
                    }
                  >
                    <option value="">Not set</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </label>
              </div>

              <label className="command-row command-row--notes">
                <span className="command-key">N</span>
                <span className="command-name">notes</span>
                <textarea
                  value={draft.notes ?? ''}
                  onChange={(event) => onDraftChange('notes', event.target.value)}
                  rows={3}
                />
              </label>

              {formError && <p className="error-text">{formError}</p>}

              <button type="submit" className="save-button">
                Save Entry (Enter)
              </button>
            </form>

            {latestInsight && (
              <article className="insight-card">
                <h3>Immediate Output: vs {latestInsight.opponentCharacter}</h3>
                <p>
                  <strong>Top recurring failure:</strong>{' '}
                  {latestInsight.topDeathCauseCategory ?? 'Not enough category data yet'}
                </p>
                <p>
                  <strong>Next drill:</strong> {latestInsight.nextDrill.title}
                </p>
                <p>
                  <strong>Focus rule:</strong> {latestInsight.focusRule}
                </p>
                <button
                  type="button"
                  className="small-action"
                  onClick={() => openMatchup(latestInsight.opponentCharacter)}
                >
                  Open Matchup Page
                </button>
              </article>
            )}
          </section>
        )}

        {activeView === 'matchup' && (
          <section className="matchup-view">
            <div className="matchup-toolbar">
              <label>
                Opponent
                <input
                  list="character-options"
                  value={selectedOpponent}
                  onChange={(event) => setSelectedOpponent(event.target.value)}
                  placeholder="Choose character"
                />
              </label>
            </div>

            {!selectedOpponent ? (
              <p className="muted">Choose an opponent to load matchup trends.</p>
            ) : matchupSummary && matchupSummary.totalEntries > 0 ? (
              <div className="matchup-grid">
                <article className="panel-card">
                  <h2>Trend (entries/week)</h2>
                  {matchupTrend.length > 0 ? (
                    <ul className="trend-list">
                      {matchupTrend.map((point) => (
                        <li key={point.weekStart}>
                          <span>{formatWeek(point.weekStart)}</span>
                          <div className="trend-bar-shell">
                            <div
                              className="trend-bar"
                              style={{ width: `${Math.max(15, point.count * 24)}px` }}
                            />
                          </div>
                          <span>{point.count}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">No trend points yet.</p>
                  )}
                </article>

                <article className="panel-card">
                  <h2>Top 3 Death Causes</h2>
                  {matchupDeathCauses.length > 0 ? (
                    <ul className="compact-list">
                      {matchupDeathCauses.map((item) => (
                        <li key={item.category}>
                          <span>{item.category}</span>
                          <span>{item.count}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">No death causes logged yet.</p>
                  )}
                </article>

                <article className="panel-card">
                  <h2>Top 3 Tags</h2>
                  {matchupSummary.topTags.length > 0 ? (
                    <ul className="compact-list">
                      {matchupSummary.topTags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">No tags logged yet.</p>
                  )}
                </article>

                <article className="panel-card">
                  <h2>Recommended Drill</h2>
                  <p className="drill-title">{matchupSummary.nextDrill.title}</p>
                  <p>{matchupSummary.nextDrill.description}</p>
                  <p>
                    <strong>Last saved rule:</strong>{' '}
                    {matchupLastRule ?? 'No saved rule yet'}
                  </p>
                  <p>
                    <strong>Focus rule:</strong> {matchupSummary.focusRule}
                  </p>
                </article>

                <article className="panel-card clips-card">
                  <h2>Clip List</h2>
                  {matchupClips.length > 0 ? (
                    <ul className="clip-list">
                      {matchupClips.map((entry) => (
                        <li key={entry.id}>
                          <a href={entry.clipLink} target="_blank" rel="noreferrer">
                            {formatDate(entry.date)}
                          </a>
                          <p>{entry.deathCauseText ?? 'No note'}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">No clips saved for this matchup.</p>
                  )}
                </article>
              </div>
            ) : (
              <p className="muted">
                No entries for {selectedOpponent}. Log one from `New Entry`.
              </p>
            )}
          </section>
        )}

        {activeView === 'log' && (
          <section className="log-view">
            <div className="filter-grid">
              <label>
                Opponent
                <input
                  list="character-options"
                  value={filters.opponentCharacter ?? ''}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      opponentCharacter: event.target.value || undefined,
                    }))
                  }
                  placeholder="Any"
                />
              </label>

              <label>
                Tag
                <select
                  value={filters.tag ?? ''}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      tag: event.target.value
                        ? (event.target.value as SituationTag)
                        : undefined,
                    }))
                  }
                >
                  <option value="">Any</option>
                  {SITUATION_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Stage
                <input
                  list="stage-options"
                  value={filters.stage ?? ''}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      stage: event.target.value || undefined,
                    }))
                  }
                  placeholder="Any"
                />
              </label>

              <label>
                Start date
                <input
                  type="date"
                  value={toDateInput(filters.startDate)}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      startDate: event.target.value
                        ? `${event.target.value}T00:00:00.000Z`
                        : undefined,
                    }))
                  }
                />
              </label>

              <label>
                End date
                <input
                  type="date"
                  value={toDateInput(filters.endDate)}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      endDate: event.target.value
                        ? `${event.target.value}T23:59:59.999Z`
                        : undefined,
                    }))
                  }
                />
              </label>

              <label className="search-filter">
                Search death cause
                <input
                  value={filters.deathCauseSearch ?? ''}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      deathCauseSearch: event.target.value || undefined,
                    }))
                  }
                  placeholder="airdodge, fair, ledge..."
                />
              </label>
            </div>

            <ul className="entry-list log-list">
              {filteredEntries.map((entry) => (
                <li key={entry.id}>
                  <div className="entry-list-head">
                    <button
                      type="button"
                      className="inline-link"
                      onClick={() => openMatchup(entry.opponentCharacter)}
                    >
                      {entry.opponentCharacter}
                    </button>
                    <span>{formatDate(entry.date)}</span>
                  </div>
                  <p>{entry.deathCauseText ?? 'No death cause logged'}</p>
                  <div className="entry-meta">
                    {entry.deathCauseCategory && <span>{entry.deathCauseCategory}</span>}
                    {entry.stage && <span>{entry.stage}</span>}
                    {entry.situationTags.length > 0 && (
                      <span>{entry.situationTags.join(', ')}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {filteredEntries.length === 0 && (
              <p className="muted">No entries match these filters.</p>
            )}
          </section>
        )}

        {activeView === 'drills' && (
          <section className="drill-view">
            <p className="muted">Pin drills you want visible for your next session.</p>
            <ul className="drill-list">
              {ALL_DRILLS.map((drill) => {
                const isPinned = pinnedDrills.includes(drill.title)

                return (
                  <li key={drill.title} className={isPinned ? 'drill-item pinned' : 'drill-item'}>
                    <div>
                      <h3>{drill.title}</h3>
                      <p>{drill.description}</p>
                      <p className="drill-meta">
                        Categories: {drill.categories.join(', ') || 'n/a'} | Tags:{' '}
                        {drill.tags.join(', ') || 'n/a'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="small-action"
                      onClick={() => onToggleDrillPin(drill.title)}
                    >
                      {isPinned ? 'Unpin' : 'Pin'}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </main>

      <datalist id="character-options">
        {opponentOptions.map((character) => (
          <option key={character} value={character} />
        ))}
      </datalist>

      <datalist id="death-cause-history">
        {deathCauseHistory.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      <datalist id="stage-options">
        {stageOptions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </div>
  )
}

function focusSoon(
  ref: RefObject<HTMLElement | null>,
): void {
  requestAnimationFrame(() => ref.current?.focus())
}

function rankDeathCauseCategories(entries: MatchEntry[], limit: number) {
  const counts = new Map<DeathCauseCategory, number>()

  for (const entry of entries) {
    if (!entry.deathCauseCategory) {
      continue
    }

    counts.set(entry.deathCauseCategory, (counts.get(entry.deathCauseCategory) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count
      }

      return left.category.localeCompare(right.category)
    })
    .slice(0, limit)
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatWeek(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

function toDateInput(value?: string): string {
  if (!value) {
    return ''
  }

  return value.slice(0, 10)
}

export default App
