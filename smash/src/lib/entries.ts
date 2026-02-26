// ABOUTME: Builds normalized match entries from user input and enforces required fields.
// ABOUTME: Provides entry creation utilities used by the keyboard-first logging flow.
import type { MatchEntry } from '../types'

export type EntryInput = Omit<MatchEntry, 'id' | 'date'> & {
  id?: string
  date?: string
}

export function createEntry(input: EntryInput): MatchEntry {
  const opponentCharacter = normalizeRequired(input.opponentCharacter)
  if (!opponentCharacter) {
    throw new Error('Opponent character is required')
  }

  return {
    id: input.id ?? crypto.randomUUID(),
    date: input.date ?? new Date().toISOString(),
    opponentCharacter,
    yourCharacter: normalizeOptional(input.yourCharacter),
    stage: normalizeOptional(input.stage),
    stockContext: input.stockContext,
    situationTags: input.situationTags,
    deathCauseText: normalizeOptional(input.deathCauseText),
    deathCauseCategory: input.deathCauseCategory,
    whatWorked: normalizeOptional(input.whatWorked),
    oneRuleNextTime: normalizeOptional(input.oneRuleNextTime),
    clipLink: normalizeOptional(input.clipLink),
    confidence: input.confidence,
    notes: normalizeOptional(input.notes),
  }
}

function normalizeRequired(value: string): string {
  return value.trim()
}

function normalizeOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}
