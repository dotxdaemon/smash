// ABOUTME: Stores the reference notes listed on the Reference tab.
// ABOUTME: Tags each note with related loss reasons so focus surfaces can link drills.
import type { LossTag } from '../types'

export type ReferenceNote = {
  title: string
  focus: string
  points: ReadonlyArray<string>
  relatedTags: ReadonlyArray<LossTag>
}

export const REFERENCE_NOTES: ReadonlyArray<ReferenceNote> = []
