// ABOUTME: Maps recurring death-cause categories to deterministic practice drills.
// ABOUTME: Exposes helpers for lookup and fallback drill selection in aggregate summaries.
import type { DeathCauseCategory, Drill } from '../types'

const DRILL_TABLE: Drill[] = [
  {
    title: '10 reps per ledge option',
    description:
      'Cycle neutral getup, roll, jump, drop-double jump, and wait in equal reps.',
    categories: ['ledge option'],
    tags: ['ledge'],
  },
  {
    title: 'Disadvantage drift discipline set',
    description:
      'Start in juggle and only use drift plus fastfall, with neutral airdodge max once.',
    categories: ['panic option in disadvantage'],
    tags: ['disadvantage', 'juggle', 'landing'],
  },
  {
    title: 'Landing mix check',
    description:
      'Run 20 landings and rotate empty land, fade back aerial, and fastfall shield.',
    categories: ['landing habit'],
    tags: ['landing', 'platform'],
  },
  {
    title: 'Shield timing reps',
    description:
      'Drill hold-shield windows and release timing against two repeated pressure strings.',
    categories: ['shield habit'],
    tags: ['shield pressure', 'out-of-shield'],
  },
  {
    title: 'Safe aerial spacing loop',
    description:
      'Do a safe aerial on shield and dash back immediately with no second hit.',
    categories: ['unsafe aerial on shield'],
    tags: ['shield pressure'],
  },
  {
    title: 'Whiff punish timing ladder',
    description:
      'Record three pokes and punish only on reaction with one selected burst option.',
    categories: ['whiff punish failure'],
    tags: ['whiff punish', 'neutral'],
  },
  {
    title: 'Approach cadence reset',
    description:
      'Play two games where every approach starts with dash shield or empty movement.',
    categories: ['approach pattern'],
    tags: ['neutral', 'corner'],
  },
  {
    title: 'Range respect drill',
    description:
      'Against longer range, hold max poke distance and only enter after shield stop.',
    categories: ['getting boxed out'],
    tags: ['neutral', 'projectile'],
  },
  {
    title: 'DI and SDI reaction lab',
    description:
      'Replay common launchers and practice preset DI paths before adding SDI timing.',
    categories: ['bad DI / no SDI'],
    tags: ['disadvantage'],
  },
  {
    title: 'Kill confirm route practice',
    description:
      'At kill percent, run 15 confirms from one starter into one preferred finisher.',
    categories: ['missed kill confirm'],
    tags: ['neutral', 'scramble'],
  },
  {
    title: 'Single OOS answer routine',
    description:
      'Shield and react to three recorded strings using one chosen OOS option only.',
    categories: ['missed OOS'],
    tags: ['out-of-shield', 'shield pressure'],
  },
  {
    title: 'Anti-air avoidance games',
    description:
      'Play two games with no full hops and rely on grounded poke plus dash shield.',
    categories: ['getting anti-aired'],
    tags: ['neutral'],
  },
]

const FALLBACK_DRILL: Drill = {
  title: 'Review and isolate one repeated loss',
  description:
    'Pick one repeated failure from recent sets and run 10 reps in training mode.',
  categories: [],
  tags: [],
}

export const ALL_DRILLS = DRILL_TABLE

export function getDrillByCategory(category?: DeathCauseCategory): Drill {
  if (!category) {
    return FALLBACK_DRILL
  }

  return (
    DRILL_TABLE.find((drill) => drill.categories.includes(category)) ?? FALLBACK_DRILL
  )
}
