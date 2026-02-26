// ABOUTME: Defines core domain types and constants for Smash matchup logging entries.
// ABOUTME: Centralizes the minimal schema used by storage, analytics, and UI modules.
export const STOCK_CONTEXTS = ['0-50', '50-100', '100-150', '150+'] as const

export const SITUATION_TAGS = [
  'neutral',
  'corner',
  'ledge',
  'disadvantage',
  'juggle',
  'landing',
  'shield pressure',
  'whiff punish',
  'scramble',
  'offstage',
  'out-of-shield',
  'platform',
  'projectile',
] as const

export const DEATH_CAUSE_CATEGORIES = [
  'ledge option',
  'panic option in disadvantage',
  'landing habit',
  'shield habit',
  'unsafe aerial on shield',
  'whiff punish failure',
  'approach pattern',
  'getting boxed out',
  'bad DI / no SDI',
  'missed kill confirm',
  'missed OOS',
  'getting anti-aired',
] as const

export type StockContext = (typeof STOCK_CONTEXTS)[number]
export type SituationTag = (typeof SITUATION_TAGS)[number]
export type DeathCauseCategory = (typeof DEATH_CAUSE_CATEGORIES)[number]

export type ConfidenceLevel = 1 | 2 | 3

export interface MatchEntry {
  id: string
  date: string
  yourCharacter?: string
  opponentCharacter: string
  stage?: string
  stockContext?: StockContext
  situationTags: SituationTag[]
  deathCauseText?: string
  deathCauseCategory?: DeathCauseCategory
  whatWorked?: string
  oneRuleNextTime?: string
  clipLink?: string
  confidence?: ConfidenceLevel
  notes?: string
}

export interface MatchupSummary {
  opponentCharacter: string
  totalEntries: number
  topDeathCauseCategory?: DeathCauseCategory
  topTags: SituationTag[]
  mostCommonRule?: string
  nextDrill: Drill
  focusRule: string
}

export interface Drill {
  title: string
  description: string
  categories: DeathCauseCategory[]
  tags: SituationTag[]
}
