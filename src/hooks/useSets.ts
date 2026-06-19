// ABOUTME: Holds saved sets in state and persists every change through one commit path.
// ABOUTME: Surfaces a storage-error flag so the views can warn when saving fails.
import { useCallback, useState } from 'react'
import { loadSets, saveSets } from '../lib/storage'
import type { SetEntry } from '../types'

export type SetsStore = {
  sets: SetEntry[]
  addSet: (entry: SetEntry) => void
  removeSet: (id: string) => void
  storageError: boolean
}

export function useSets(): SetsStore {
  const [sets, setSets] = useState<SetEntry[]>(loadSets)
  const [storageError, setStorageError] = useState(false)

  const commit = useCallback((next: SetEntry[]) => {
    setSets(next)
    try {
      saveSets(next)
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [])

  const addSet = useCallback(
    (entry: SetEntry) => commit([entry, ...sets]),
    [commit, sets],
  )

  const removeSet = useCallback(
    (id: string) => commit(sets.filter((set) => set.id !== id)),
    [commit, sets],
  )

  return { sets, addSet, removeSet, storageError }
}
