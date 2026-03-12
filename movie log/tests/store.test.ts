// ABOUTME: Verifies that the desktop app persists watch history and watched folders on disk.
// ABOUTME: Uses real temporary files so the store behavior matches the local desktop runtime.
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHistoryStore } from '../electron/store.js';
import { createEntryFromPath } from '../shared/history.js';

describe('createHistoryStore', () => {
  let dataDirectory = '';

  beforeEach(async () => {
    dataDirectory = await mkdtemp(join(tmpdir(), 'movie-log-store-'));
  });

  afterEach(async () => {
    await rm(dataDirectory, { recursive: true, force: true });
  });

  it('persists history and watched folders across reloads', async () => {
    const store = createHistoryStore(dataDirectory);

    await store.addHistoryEntry(
      createEntryFromPath('/Users/seankim/Media Inbox/Flow', 'drop', '2026-03-12T08:00:00.000Z')
    );
    await store.addWatchedFolder('/Users/seankim/Media Inbox');

    const reloaded = createHistoryStore(dataDirectory);
    const state = await reloaded.readState();

    expect(state.history).toHaveLength(1);
    expect(state.history[0]?.title).toBe('Flow');
    expect(state.watchedFolders).toHaveLength(1);
    expect(state.watchedFolders[0]?.path).toBe('/Users/seankim/Media Inbox');
  });

  it('persists the current contents of a watched folder after a scan', async () => {
    const store = createHistoryStore(dataDirectory);

    await store.addWatchedFolder('/Users/seankim/Movies');
    await store.syncWatchedFolderContents(
      '/Users/seankim/Movies',
      [
        {
          sourceKind: 'directory',
          sourcePath: '/Users/seankim/Movies/Severance',
          title: 'Severance'
        },
        {
          sourceKind: 'file',
          sourcePath: '/Users/seankim/Movies/The Brutalist.mkv',
          title: 'The Brutalist'
        }
      ],
      '2026-03-12T09:00:00.000Z'
    );

    const reloaded = createHistoryStore(dataDirectory);
    const state = await reloaded.readState();

    expect(state.libraryItems.map((item) => item.title)).toEqual(['Severance', 'The Brutalist']);
    expect(state.watchedFolders[0]?.lastScannedAt).toBe('2026-03-12T09:00:00.000Z');
  });

  it('replaces removed items when a later folder scan updates the snapshot', async () => {
    const store = createHistoryStore(dataDirectory);

    await store.addWatchedFolder('/Users/seankim/Movies');
    await store.syncWatchedFolderContents(
      '/Users/seankim/Movies',
      [
        {
          sourceKind: 'directory',
          sourcePath: '/Users/seankim/Movies/Severance',
          title: 'Severance'
        },
        {
          sourceKind: 'file',
          sourcePath: '/Users/seankim/Movies/The Brutalist.mkv',
          title: 'The Brutalist'
        }
      ],
      '2026-03-12T09:00:00.000Z'
    );

    await store.syncWatchedFolderContents(
      '/Users/seankim/Movies',
      [
        {
          sourceKind: 'directory',
          sourcePath: '/Users/seankim/Movies/Severance',
          title: 'Severance'
        },
        {
          sourceKind: 'file',
          sourcePath: '/Users/seankim/Movies/Flow.mkv',
          title: 'Flow'
        }
      ],
      '2026-03-13T09:00:00.000Z'
    );

    const state = await store.readState();
    const severance = state.libraryItems.find((item) => item.title === 'Severance');

    expect(state.libraryItems.map((item) => item.title)).toEqual(['Flow', 'Severance']);
    expect(severance?.firstSeenAt).toBe('2026-03-12T09:00:00.000Z');
    expect(severance?.lastSeenAt).toBe('2026-03-13T09:00:00.000Z');
  });
});
