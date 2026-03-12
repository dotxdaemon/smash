// ABOUTME: Scans a chosen folder and returns the current top-level media items that should populate the app.
// ABOUTME: Keeps folder population deterministic for startup scans, manual adds, and scheduled refreshes.
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createEntryFromPath } from '../shared/history.js';
import type { EntryKind, FolderContentsItem } from '../shared/types.js';

export async function scanFolderContents(folderPath: string): Promise<FolderContentsItem[]> {
  try {
    const entries = await readdir(folderPath, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory() || entry.isFile())
      .map((entry) => {
        const sourcePath = join(folderPath, entry.name);
        const sourceKind: EntryKind = entry.isDirectory() ? 'directory' : 'file';
        const watchEntry = createEntryFromPath(sourcePath, 'watch', '1970-01-01T00:00:00.000Z', sourceKind);

        return {
          sourceKind,
          sourcePath,
          title: watchEntry.title
        };
      })
      .sort((left, right) => left.title.localeCompare(right.title) || left.sourcePath.localeCompare(right.sourcePath));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}
