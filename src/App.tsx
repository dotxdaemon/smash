// ABOUTME: Composes the set logging, history, and matchup tracker around saved sets.
// ABOUTME: Owns view selection, matchup drill-in, undo, focus, and storage-error messaging.
import { useEffect, useMemo, useRef, useState } from 'react'
import { NeonBackdrop } from './components/NeonBackdrop'
import { Scoreboard } from './components/Scoreboard'
import { NavTabs } from './components/NavTabs'
import { LogForm } from './components/LogForm'
import { HistoryView } from './components/HistoryView'
import { StatsView } from './components/StatsView'
import { MatchupPanel } from './components/MatchupPanel'
import { ReferenceView } from './components/ReferenceView'
import { Toast, type ToastData } from './components/Toast'
import { useSets } from './hooks/useSets'
import { buildSetsBackup, createSetEntry, type SetEntryInput } from './lib/sets'
import { getMatchupSummary, getNextSetFocus } from './lib/training'
import { getOpponentRecords, getOverallRecord, getRecentForm } from './lib/stats'
import type { SetEntry } from './types'

type View = 'log' | 'history' | 'stats' | 'notes'

const TABS: ReadonlyArray<{ id: View; label: string }> = [
  { id: 'log', label: 'Log set' },
  { id: 'history', label: 'History' },
  { id: 'stats', label: 'Stats' },
  { id: 'notes', label: 'Reference' },
]

const TOAST_DURATION = 7000

function App() {
  const { sets, addSet, removeSet, storageError } = useSets()
  const [view, setView] = useState<View>('log')
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [toastPaused, setToastPaused] = useState(false)
  const undoableSet = useRef<SetEntry | null>(null)
  const workspaceRef = useRef<HTMLElement>(null)
  const restoreFocusToWorkspace = useRef(false)

  const sortedSets = useMemo(
    () => [...sets].sort((a, b) => b.date.localeCompare(a.date)),
    [sets],
  )
  const overallRecord = useMemo(() => getOverallRecord(sets), [sets])
  const recentForm = useMemo(() => getRecentForm(sets), [sets])
  const opponentRecords = useMemo(() => getOpponentRecords(sets), [sets])
  const nextFocus = useMemo(() => getNextSetFocus(sortedSets), [sortedSets])
  const matchup = useMemo(() => {
    if (!selectedOpponent) return null
    const summary = getMatchupSummary(sets, selectedOpponent)
    return summary.total > 0 ? summary : null
  }, [selectedOpponent, sets])

  useEffect(() => {
    if (!toast || toastPaused) return
    const timer = window.setTimeout(() => {
      setToast(null)
      undoableSet.current = null
    }, TOAST_DURATION)
    return () => window.clearTimeout(timer)
  }, [toast, toastPaused])

  useEffect(() => {
    if (!selectedOpponent) {
      if (restoreFocusToWorkspace.current) {
        restoreFocusToWorkspace.current = false
        workspaceRef.current?.focus()
      }
      return
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        restoreFocusToWorkspace.current = true
        setSelectedOpponent(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedOpponent])

  function selectView(nextView: View) {
    setView(nextView)
    setSelectedOpponent(null)
  }

  function openMatchup(opponent: string) {
    setSelectedOpponent(opponent)
  }

  function closeMatchup() {
    restoreFocusToWorkspace.current = true
    setSelectedOpponent(null)
  }

  function logSet(input: SetEntryInput) {
    const entry = createSetEntry(input)
    addSet(entry)
    undoableSet.current = null
    setToastPaused(false)
    setToast({ id: Date.now(), message: `Set logged — vs ${entry.opponent}` })
  }

  function exportSets() {
    const { filename, json } = buildSetsBackup(sets, new Date().toISOString())
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  function deleteSet(id: string) {
    const removed = sets.find((set) => set.id === id)
    if (!removed) return
    removeSet(id)
    undoableSet.current = removed
    setToastPaused(false)
    setToast({ id: Date.now(), message: 'Set deleted.', actionLabel: 'Undo' })
  }

  function undoDelete() {
    if (undoableSet.current) {
      addSet(undoableSet.current)
      undoableSet.current = null
    }
    setToast(null)
    workspaceRef.current?.focus()
  }

  return (
    <>
      <NeonBackdrop />
      <div
        data-visual-system="night-console"
        data-layout="compact-workspace"
        className="app-shell"
      >
        <div className="app-frame">
          <header className="app-header">
            <div className="brand">
              <span className="brand-kicker">Palutena training log</span>
              <h1 className="brand-title">Smash Tracker</h1>
            </div>
            <div className="header-aside">
              <Scoreboard record={overallRecord} form={recentForm} />
              {sets.length > 0 && (
                <button
                  type="button"
                  className="export-action"
                  onClick={exportSets}
                  aria-label="Export all sets as a JSON backup"
                >
                  ↓ Export backup
                </button>
              )}
            </div>
          </header>

          <NavTabs tabs={TABS} active={view} label="Views" onChange={selectView} />

          {storageError && (
            <p className="storage-banner" role="alert">
              Saving is unavailable — sets logged now won’t be kept after you close
              the app.
            </p>
          )}

          <main
            ref={workspaceRef}
            className="workspace"
            data-matchup-pages="history-opponents"
            role="tabpanel"
            id={`panel-${view}`}
            aria-labelledby={`tab-${view}`}
            tabIndex={-1}
          >
            {matchup ? (
              <MatchupPanel
                matchup={matchup}
                backLabel={view === 'stats' ? 'Back to stats' : 'Back to history'}
                onBack={closeMatchup}
                onDelete={deleteSet}
              />
            ) : (
              <>
                {view === 'log' && <LogForm focus={nextFocus} onSubmit={logSet} />}

                {view === 'history' && (
                  <HistoryView
                    sets={sortedSets}
                    onOpenOpponent={openMatchup}
                    onDelete={deleteSet}
                    onLog={() => selectView('log')}
                  />
                )}

                {view === 'stats' && (
                  <StatsView
                    records={opponentRecords}
                    onOpenOpponent={openMatchup}
                    onLog={() => selectView('log')}
                  />
                )}

                {view === 'notes' && <ReferenceView />}
              </>
            )}
          </main>
        </div>
      </div>

      <Toast
        toast={toast}
        onAction={undoDelete}
        onPause={() => setToastPaused(true)}
        onResume={() => setToastPaused(false)}
      />
    </>
  )
}

export default App
