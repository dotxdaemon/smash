// ABOUTME: Builds training focus, loss habits, and matchup summaries from saved sets.
// ABOUTME: Keeps recommendation logic deterministic and independent from views.
import { SERAPH_NOTES } from '../data/seraphNotes'
import type { LossTag, SetEntry } from '../types'

export const LOSS_TAGS: ReadonlyArray<{
  id: LossTag
  label: string
  focus: string
}> = [
  {
    id: 'got-grabbed',
    label: 'Got grabbed',
    focus: 'keep Palutena outside grab range and punish the whiff.',
  },
  {
    id: 'could-not-land',
    label: 'Could not land',
    focus: 'drift to ledge or teleport reset instead of forcing a landing button.',
  },
  {
    id: 'missed-kill',
    label: 'Missed kill',
    focus: 'take safe ledgetraps before chasing a hard kill.',
  },
  {
    id: 'shield-pressure',
    label: 'Shield pressure',
    focus: 'reset with retreating aerials before shield gets pinned.',
  },
  {
    id: 'edgeguarded',
    label: 'Edgeguarded',
    focus: 'delay teleport timing so the edgeguard has to commit first.',
  },
  {
    id: 'panic-option',
    label: 'Panic option',
    focus: 'hold your position for one beat before choosing an escape.',
  },
]

const LOSS_TAG_BY_ID = new Map(LOSS_TAGS.map((tag) => [tag.id, tag]))

export type DrillNote = {
  title: string
  focus: string
}

export type TrainingFocus = {
  title: 'Next set focus'
  detail: string
  opponent?: string
  tagLabel?: string
  drills?: DrillNote[]
}

export type LossHabit = {
  id: LossTag
  label: string
  total: number
  recent: number
}

export type LossTagSummary = {
  id: LossTag
  label: string
  count: number
}

export type MatchupSummary = {
  opponent: string
  wins: number
  losses: number
  total: number
  commonLossTags: LossTagSummary[]
  notes: string[]
  recentSets: SetEntry[]
  focus: TrainingFocus
}

export function isLossTag(value: unknown): value is LossTag {
  return typeof value === 'string' && LOSS_TAG_BY_ID.has(value as LossTag)
}

export function getNextSetFocus(
  sets: SetEntry[],
  opponent?: string,
): TrainingFocus {
  const relevantSets = sortSets(sets).filter(
    (set) => opponent === undefined || set.opponent === opponent,
  )
  const losses = relevantSets.filter((set) => set.result === 'loss')
  const [topTag] = rankLossTags(losses)

  if (!topTag) {
    return {
      title: 'Next set focus',
      detail: 'Tag a loss to get a matchup-specific focus.',
    }
  }

  const tag = LOSS_TAG_BY_ID.get(topTag.id)
  const sourceSet = losses.find((set) => set.lossTags?.includes(topTag.id))
  const focusOpponent = opponent ?? sourceSet?.opponent

  if (!tag) {
    return {
      title: 'Next set focus',
      detail: 'Tag a loss to get a matchup-specific focus.',
    }
  }

  return {
    title: 'Next set focus',
    opponent: focusOpponent,
    tagLabel: tag.label,
    detail: focusOpponent
      ? `Against ${focusOpponent}, ${tag.focus}`
      : tag.focus,
    drills: getDrillsForTag(topTag.id).slice(0, 2),
  }
}

export function getDrillsForTag(tag: LossTag): DrillNote[] {
  return SERAPH_NOTES.filter((note) => note.relatedTags.includes(tag)).map(
    ({ title, focus }) => ({ title, focus }),
  )
}

export function getLossHabits(sets: SetEntry[], recentCount = 10): LossHabit[] {
  const ordered = sortSets(sets)
  const recentIds = new Set(ordered.slice(0, recentCount).map((set) => set.id))
  const counts = new Map<LossTag, { total: number; recent: number }>()

  for (const set of ordered) {
    if (set.result !== 'loss') continue
    for (const tag of set.lossTags ?? []) {
      const current = counts.get(tag) ?? { total: 0, recent: 0 }
      current.total += 1
      if (recentIds.has(set.id)) current.recent += 1
      counts.set(tag, current)
    }
  }

  return Array.from(counts.entries())
    .map(([id, value]) => ({
      id,
      label: LOSS_TAG_BY_ID.get(id)?.label ?? id,
      ...value,
    }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        b.recent - a.recent ||
        a.label.localeCompare(b.label),
    )
}

export function getMatchupSummary(
  sets: SetEntry[],
  opponent: string,
): MatchupSummary {
  const recentSets = sortSets(sets.filter((set) => set.opponent === opponent))
  const wins = recentSets.filter((set) => set.result === 'win').length
  const losses = recentSets.filter((set) => set.result === 'loss').length

  return {
    opponent,
    wins,
    losses,
    total: recentSets.length,
    commonLossTags: rankLossTags(
      recentSets.filter((set) => set.result === 'loss'),
    )
      .slice(0, 3)
      .map(({ id, count }) => ({
        id,
        label: LOSS_TAG_BY_ID.get(id)?.label ?? id,
        count,
      })),
    notes: recentSets
      .map((set) => set.notes)
      .filter((note): note is string => Boolean(note))
      .slice(0, 3),
    recentSets: recentSets.slice(0, 5),
    focus: getNextSetFocus(recentSets, opponent),
  }
}

function rankLossTags(sets: SetEntry[]): Array<{ id: LossTag; count: number }> {
  const counts = new Map<LossTag, { count: number; firstSeen: number }>()

  sets.forEach((set, setIndex) => {
    for (const tag of set.lossTags ?? []) {
      const current = counts.get(tag) ?? { count: 0, firstSeen: setIndex }
      counts.set(tag, {
        count: current.count + 1,
        firstSeen: Math.min(current.firstSeen, setIndex),
      })
    }
  })

  return Array.from(counts.entries())
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => b.count - a.count || a.firstSeen - b.firstSeen)
}

function sortSets(sets: SetEntry[]): SetEntry[] {
  return [...sets].sort((a, b) => b.date.localeCompare(a.date))
}
