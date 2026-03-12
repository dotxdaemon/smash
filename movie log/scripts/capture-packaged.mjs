// ABOUTME: Launches the packaged macOS Movie Log app with seeded data and captures a proof screenshot.
// ABOUTME: Verifies the installed-style app bundle works without the Vite dev server or source Electron entrypoint.
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';

const capturePath = join(homedir(), '.codex-artifacts', 'movie-log-packaged.png');
const packagedAppPath = join(process.cwd(), 'release', 'mac', 'Movie Log.app', 'Contents', 'MacOS', 'Electron');
const temporaryDataDirectory = await mkdtemp(join(tmpdir(), 'movie-log-packaged-'));
const sampleFolderPath = join(temporaryDataDirectory, 'Media Inbox');

await mkdir(sampleFolderPath, { recursive: true });
await mkdir(join(sampleFolderPath, 'Severance'));
await writeFile(join(sampleFolderPath, 'The Brutalist.mkv'), 'movie');

const seededState = {
  history: [
    {
      id: `2026-03-12T09:00:00.000Z:${join(sampleFolderPath, 'Severance')}`,
      source: 'drop',
      sourceKind: 'directory',
      sourcePath: join(sampleFolderPath, 'Severance'),
      title: 'Severance',
      watchedAt: '2026-03-12T09:00:00.000Z'
    },
    {
      id: `2026-03-12T08:15:00.000Z:${join(sampleFolderPath, 'The Brutalist.mkv')}`,
      source: 'watch',
      sourceKind: 'file',
      sourcePath: join(sampleFolderPath, 'The Brutalist.mkv'),
      title: 'The Brutalist',
      watchedAt: '2026-03-12T08:15:00.000Z'
    }
  ],
  libraryItems: [],
  knownPathsByFolder: {
    [sampleFolderPath]: []
  },
  watchedFolders: [
    {
      id: sampleFolderPath,
      addedAt: '2026-03-12T07:45:00.000Z',
      lastScannedAt: null,
      name: 'Media Inbox',
      path: sampleFolderPath
    }
  ]
};

await writeFile(join(temporaryDataDirectory, 'movie-log.json'), `${JSON.stringify(seededState, null, 2)}\n`, 'utf8');

try {
  await new Promise((resolve, reject) => {
    const packagedApp = spawn(packagedAppPath, [], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: false,
      env: {
        ...process.env,
        MOVIE_LOG_CAPTURE_PATH: capturePath,
        MOVIE_LOG_DATA_DIR: temporaryDataDirectory
      }
    });

    packagedApp.once('exit', (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      reject(new Error(`Packaged app capture exited with code ${code ?? 'null'}`));
    });

    packagedApp.once('error', reject);
  });

  process.stdout.write(`${capturePath}\n`);
} finally {
  await rm(temporaryDataDirectory, { recursive: true, force: true });
}
