// ABOUTME: Verifies that the app can scan an existing folder and turn its current contents into library items.
// ABOUTME: Uses the real filesystem so initial population matches the actual desktop scanning behavior.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { scanFolderContents } from '../electron/folder-scan.js';

describe('scanFolderContents', () => {
  let rootDirectory = '';

  beforeEach(async () => {
    rootDirectory = await mkdtemp(join(tmpdir(), 'movie-log-scan-'));
  });

  afterEach(async () => {
    await rm(rootDirectory, { recursive: true, force: true });
  });

  it('lists the current top-level files and folders for initial population', async () => {
    const moviesPath = join(rootDirectory, 'Movies');
    await mkdir(moviesPath);
    await mkdir(join(moviesPath, 'Severance'));
    await writeFile(join(moviesPath, 'The Brutalist.mkv'), 'movie');

    const items = await scanFolderContents(moviesPath);

    expect(items).toEqual([
      {
        sourceKind: 'directory',
        sourcePath: join(moviesPath, 'Severance'),
        title: 'Severance'
      },
      {
        sourceKind: 'file',
        sourcePath: join(moviesPath, 'The Brutalist.mkv'),
        title: 'The Brutalist'
      }
    ]);
  });
});
