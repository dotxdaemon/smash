// ABOUTME: Renders the desktop movie log interface and responds to folder and drop events.
// ABOUTME: Shows watched folders, a manual drop target, and the recent watch history list.
import { startTransition, useEffect, useState, type DragEvent } from 'react';
import type { LibraryItem, MovieLogState } from '../shared/types';

const emptyState: MovieLogState = {
  history: [],
  libraryItems: [],
  watchedFolders: []
};

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short'
});

function updateState(nextState: MovieLogState, setState: (value: MovieLogState) => void): void {
  startTransition(() => {
    setState(nextState);
  });
}

export default function App() {
  const [state, setState] = useState<MovieLogState>(emptyState);
  const [dropActive, setDropActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadState = async () => {
      const nextState = await window.movieLog.getState();
      if (isMounted) {
        updateState(nextState, setState);
      }
    };

    void loadState();

    const unsubscribe = window.movieLog.subscribe((nextState) => {
      updateState(nextState, setState);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handlePickWatchedFolder = async () => {
    setErrorMessage('');

    try {
      await window.movieLog.pickWatchedFolder();
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleRemoveWatchedFolder = async (folderId: string) => {
    setErrorMessage('');

    try {
      await window.movieLog.removeWatchedFolder(folderId);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleDrop = async (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDropActive(false);
    setErrorMessage('');

    const paths = Array.from(event.dataTransfer.files)
      .map((file) => window.movieLog.pathForFile(file))
      .filter((itemPath) => itemPath.length > 0);

    if (paths.length === 0) {
      setErrorMessage('Drop a Finder file or folder so the app can record its full path.');
      return;
    }

    try {
      await window.movieLog.logPaths(paths);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const historyItems = state.history.slice(0, 20);
  const libraryItems = state.libraryItems.slice(0, 30);

  const groupedLibraryItems = libraryItems.reduce<Map<string, LibraryItem[]>>((groups, item) => {
    const existing = groups.get(item.folderPath) ?? [];
    existing.push(item);
    groups.set(item.folderPath, existing);
    return groups;
  }, new Map());

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Local Desktop Watch Log</p>
          <h1>Drop it in. Keep the record. Move on.</h1>
          <p className="summary">
            Movie Log scans folders you choose, populates a local snapshot of what is already there, and refreshes
            that record on launch plus a daily rescan while the app is open.
          </p>
        </div>
        <div className="stat-grid" aria-label="Current totals">
          <article className="stat-card">
            <span className="stat-value">{state.history.length}</span>
            <span className="stat-label">Activity Entries</span>
          </article>
          <article className="stat-card">
            <span className="stat-value">{state.watchedFolders.length}</span>
            <span className="stat-label">Scanned Folders</span>
          </article>
          <article className="stat-card">
            <span className="stat-value">{state.libraryItems.length}</span>
            <span className="stat-label">Tracked Titles</span>
          </article>
        </div>
      </section>

      <section
        className={dropActive ? 'drop-zone drop-zone-active' : 'drop-zone'}
        onDragEnter={() => setDropActive(true)}
        onDragLeave={() => setDropActive(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setDropActive(true);
        }}
        onDrop={handleDrop}
      >
        <p className="drop-kicker">Manual Log</p>
        <h2>Drop a file or folder from Finder</h2>
        <p className="drop-copy">
          Each top-level drop becomes one activity entry. Chosen folders scan their current top-level contents on
          add, then refresh automatically every day while the app stays open.
        </p>
      </section>

      {errorMessage ? (
        <section className="message-strip" role="alert">
          {errorMessage}
        </section>
      ) : null}

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Folder Scans</p>
              <h2>Scanned folders</h2>
            </div>
            <button className="panel-button" onClick={() => void handlePickWatchedFolder()} type="button">
              Add Scan Folder
            </button>
          </div>

          {state.watchedFolders.length === 0 ? (
            <p className="empty-copy">Choose a folder like ~/Movies to populate the app from its current contents.</p>
          ) : (
            <ul className="stack-list">
              {state.watchedFolders.map((folder) => (
                <li className="list-card" key={folder.id}>
                  <div>
                    <strong>{folder.name}</strong>
                    <p className="meta-path">{folder.path}</p>
                    <p className="history-time">
                      {folder.lastScannedAt
                        ? `Last scanned ${timestampFormatter.format(new Date(folder.lastScannedAt))}`
                        : 'Waiting for first scan'}
                    </p>
                  </div>
                  <button
                    className="ghost-button"
                    onClick={() => void handleRemoveWatchedFolder(folder.id)}
                    type="button"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Folder Snapshot</p>
              <h2>What is currently in your folders</h2>
            </div>
          </div>

          {libraryItems.length === 0 ? (
            <p className="empty-copy">No scanned titles yet. Add a folder and the app will populate this list.</p>
          ) : (
            <div className="snapshot-groups">
              {Array.from(groupedLibraryItems.entries()).map(([folderPath, items]) => (
                <section className="snapshot-group" key={folderPath}>
                  <p className="history-time">{folderPath}</p>
                  <ol className="history-list">
                    {items.map((item) => (
                      <li className="history-card" key={item.id}>
                        <div className="history-topline">
                          <strong>{item.title}</strong>
                          <span className="history-badge">{item.sourceKind === 'file' ? 'File' : 'Folder'}</span>
                        </div>
                        <p className="history-time">
                          Seen {timestampFormatter.format(new Date(item.lastSeenAt))}
                        </p>
                        <p className="meta-path">{item.sourcePath}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </article>

        <article className="panel panel-wide">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Recent Activity</p>
              <h2>What the app logged recently</h2>
            </div>
          </div>

          {historyItems.length === 0 ? (
            <p className="empty-copy">No activity yet. Drops and newly discovered folder arrivals will show up here.</p>
          ) : (
            <ol className="history-list">
              {historyItems.map((entry) => (
                <li className="history-card" key={entry.id}>
                  <div className="history-topline">
                    <strong>{entry.title}</strong>
                    <span className="history-badge">{entry.source === 'drop' ? 'Dropped' : 'Folder Sync'}</span>
                  </div>
                  <p className="history-time">{timestampFormatter.format(new Date(entry.watchedAt))}</p>
                  <p className="meta-path">{entry.sourcePath}</p>
                </li>
              ))}
            </ol>
          )}
        </article>
      </section>
    </main>
  );
}
