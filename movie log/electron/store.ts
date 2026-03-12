// ABOUTME: Persists watch history and watched folders as local JSON in the desktop app data directory.
// ABOUTME: Provides the minimal read and write operations needed by the Electron process and tests.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { sortEntriesByWatchedAt } from '../shared/history.js';
import type { FolderContentsItem, LibraryItem, MovieLogState, WatchEntry, WatchedFolder } from '../shared/types.js';

interface PersistedState extends MovieLogState {
  knownPathsByFolder: Record<string, string[]>;
}

const EMPTY_STATE: PersistedState = {
  history: [],
  libraryItems: [],
  knownPathsByFolder: {},
  watchedFolders: []
};

function mergeHistoryEntries(existingEntries: WatchEntry[], incomingEntries: WatchEntry[]): WatchEntry[] {
  const knownPaths = new Set(existingEntries.map((entry) => entry.sourcePath));
  const addedPaths = new Set<string>();
  const uniqueIncomingEntries = incomingEntries.filter((entry) => {
    if (knownPaths.has(entry.sourcePath) || addedPaths.has(entry.sourcePath)) {
      return false;
    }

    addedPaths.add(entry.sourcePath);
    return true;
  });

  return sortEntriesByWatchedAt([...uniqueIncomingEntries, ...existingEntries]);
}

function sortLibraryItems(items: LibraryItem[]): LibraryItem[] {
  return [...items].sort((left, right) => left.title.localeCompare(right.title) || left.sourcePath.localeCompare(right.sourcePath));
}

function cloneState(state: PersistedState): PersistedState {
  return {
    history: [...state.history],
    libraryItems: [...state.libraryItems],
    knownPathsByFolder: { ...state.knownPathsByFolder },
    watchedFolders: [...state.watchedFolders]
  };
}

export function createHistoryStore(dataDirectory: string) {
  const dataFilePath = join(dataDirectory, 'movie-log.json');

  async function readPersistedState(): Promise<PersistedState> {
    await mkdir(dataDirectory, { recursive: true });

    try {
      const stored = await readFile(dataFilePath, 'utf8');
      const parsed = JSON.parse(stored) as Partial<PersistedState>;

      return {
        history: sortEntriesByWatchedAt(parsed.history ?? []),
        libraryItems: sortLibraryItems(parsed.libraryItems ?? []),
        knownPathsByFolder: parsed.knownPathsByFolder ?? {},
        watchedFolders: parsed.watchedFolders ?? []
      };
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;

      if (code === 'ENOENT') {
        return cloneState(EMPTY_STATE);
      }

      throw error;
    }
  }

  async function writePersistedState(state: PersistedState): Promise<void> {
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(dataFilePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  }

  return {
    async readState(): Promise<MovieLogState> {
      const state = await readPersistedState();

      return {
        history: sortEntriesByWatchedAt(state.history),
        libraryItems: sortLibraryItems(state.libraryItems),
        watchedFolders: [...state.watchedFolders]
      };
    },

    async addHistoryEntry(entry: WatchEntry): Promise<WatchEntry> {
      const state = await readPersistedState();
      state.history = mergeHistoryEntries(state.history, [entry]);
      await writePersistedState(state);
      return entry;
    },

    async addHistoryEntries(entries: WatchEntry[]): Promise<WatchEntry[]> {
      const state = await readPersistedState();
      state.history = mergeHistoryEntries(state.history, entries);
      await writePersistedState(state);
      return entries;
    },

    async clearHistory(): Promise<void> {
      const state = await readPersistedState();
      state.history = [];
      await writePersistedState(state);
    },

    async addWatchedFolder(folderPath: string): Promise<WatchedFolder> {
      const state = await readPersistedState();
      const existing = state.watchedFolders.find((folder) => folder.path === folderPath);

      if (existing) {
        return existing;
      }

      const folder: WatchedFolder = {
        id: folderPath,
        addedAt: new Date().toISOString(),
        lastScannedAt: null,
        name: basename(folderPath) || folderPath,
        path: folderPath
      };

      state.watchedFolders = [...state.watchedFolders, folder];
      state.knownPathsByFolder[folderPath] = state.knownPathsByFolder[folderPath] ?? [];
      await writePersistedState(state);
      return folder;
    },

    async removeWatchedFolder(folderId: string): Promise<WatchedFolder | null> {
      const state = await readPersistedState();
      const folder = state.watchedFolders.find((item) => item.id === folderId) ?? null;

      if (!folder) {
        return null;
      }

      state.watchedFolders = state.watchedFolders.filter((item) => item.id !== folderId);
      state.libraryItems = state.libraryItems.filter((item) => item.folderId !== folder.id);
      delete state.knownPathsByFolder[folder.path];
      await writePersistedState(state);
      return folder;
    },

    async syncWatchedFolderContents(
      folderPath: string,
      items: FolderContentsItem[],
      scannedAt = new Date().toISOString()
    ): Promise<FolderContentsItem[]> {
      const state = await readPersistedState();
      const knownPaths = new Set(state.knownPathsByFolder[folderPath] ?? []);
      const existingItemsByPath = new Map(
        state.libraryItems.filter((item) => item.folderPath === folderPath).map((item) => [item.sourcePath, item])
      );
      const folder = state.watchedFolders.find((item) => item.path === folderPath);
      const nextItems: LibraryItem[] = items.map((item) => {
        const existing = existingItemsByPath.get(item.sourcePath);

        return {
          ...item,
          id: item.sourcePath,
          firstSeenAt: existing?.firstSeenAt ?? scannedAt,
          folderId: folder?.id ?? folderPath,
          folderPath,
          lastSeenAt: scannedAt
        };
      });

      state.libraryItems = sortLibraryItems([
        ...state.libraryItems.filter((item) => item.folderPath !== folderPath),
        ...nextItems
      ]);
      state.knownPathsByFolder[folderPath] = items.map((item) => item.sourcePath);
      state.watchedFolders = state.watchedFolders.map((item) =>
        item.path === folderPath ? { ...item, lastScannedAt: scannedAt } : item
      );
      await writePersistedState(state);

      return nextItems
        .filter((item) => !knownPaths.has(item.sourcePath))
        .map(({ sourceKind, sourcePath, title }) => ({ sourceKind, sourcePath, title }));
    },

    async readKnownPaths(folderPath: string): Promise<string[]> {
      const state = await readPersistedState();
      return [...(state.knownPathsByFolder[folderPath] ?? [])];
    },

    async writeKnownPaths(folderPath: string, knownPaths: string[]): Promise<void> {
      const state = await readPersistedState();
      state.knownPathsByFolder[folderPath] = [...knownPaths];
      await writePersistedState(state);
    },

    getDataFilePath(): string {
      return dataFilePath;
    }
  };
}
