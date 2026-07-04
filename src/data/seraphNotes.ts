// ABOUTME: Stores the Palutena quick-review notes supplied for the tracker.
// ABOUTME: Tags each note with related loss reasons so focus surfaces can link drills.
import type { LossTag } from '../types'

export type SeraphNote = {
  title: string
  focus: string
  points: ReadonlyArray<string>
  relatedTags: ReadonlyArray<LossTag>
}

export const SERAPH_NOTES_SUBTITLE = 'Palutena matchup and gameplay adjustments'

export const SERAPH_NOTES_SUMMARY =
  'Use this as a quick review sheet before sets: prioritize safer advantage pressure, cleaner ledge spacing, broader disadvantage mix-ups, and better resource awareness.'

export const SMASH_PEOPLE_NOTES: ReadonlyArray<string> = [
  'Josh - Stay patient, look for options rather than commitments. Stay outside the triangle',
  'Kipum - Play at my own pace, don’t let his punish game scare me from playing the game. Play neutral more grounded, observe what he does out of shield (drift-back, aerial, grab, etc.)',
  '6/23 - Avoid setups, watch for habits. Stay outside the triangle. Don’t commit too much',
]

export const SMASH_FUNDAMENTALS_REMINDER =
  'Play NEUTRAL, ADVANTAGE AND DISADVANTAGE deliberately. Don’t just rush in/mash buttons/hope to kill them. Have a plan for what the opponent is showing you. Gather data.'

export const SERAPH_NOTES: ReadonlyArray<SeraphNote> = [
  {
    title: 'Up air advantage state',
    focus:
      'Against opponents who neutral air dodge full-hop up airs, shark more with fast-fall short-hop up airs.',
    points: [
      'This is especially useful when they like neutral air dodging into the platform, which is common.',
      'If the up air misses, you land sooner and have a much lower chance of being reversed out of advantage.',
    ],
    relatedTags: [],
  },
  {
    title: 'Down tilt 2-frames by ledge',
    focus: 'You are getting too close to the ledge, especially against Mario.',
    points: [
      'In Mario vs. Palutena, if you stand too close, Mario can hold down and beat your down tilt with up B.',
      "Space it so only the down tilt touches ledge. If spaced correctly, Mario's up B should not hit the down tilt.",
      'The goal is more consistent 2-frames with no trade on your attack.',
    ],
    relatedTags: ['missed-kill'],
  },
  {
    title: 'Disadvantage panic options',
    focus:
      'You often neutral air dodge fast-fall to the ground after getting hit once in juggles or weird air spots.',
    points: [
      'Neutral air dodge is not a bad option, but you are getting very antsy with it.',
      'Mix in retreating, drifting, and fast-falling to platforms.',
      'Use teleport cancels off platforms as a disadvantage mix-up, which you did not do.',
      'Sometimes retreat to ledge, especially against characters that are not oppressive ledge trappers.',
    ],
    relatedTags: ['panic-option', 'could-not-land'],
  },
  {
    title: 'Edgeguard vs. ledge trap decisions',
    focus:
      "Be more aware of your opponent's off-stage resources and know when to value the ledge trap over the edgeguard.",
    points: [
      'Risky edgeguards are making you prone to reversals because you give up control.',
      'Time nairs better off stage, especially in the Mario matchup, to force a trade and get the semi-spike.',
    ],
    relatedTags: ['missed-kill'],
  },
  {
    title: 'Pummel flowchart',
    focus: 'Your pummel flowchart is off, so you are missing free damage.',
    points: [
      '0%: no pummel.',
      'Low percent: 1 pummel.',
      'Mid percent: 2 pummels.',
      'High percent: 3 pummels.',
      'Immediate back throw with no pummel is still a useful DI mix-up to kill as soon as possible.',
      'When the opponent has 0% chance of dying to any throw, take the free pummel damage.',
    ],
    relatedTags: [],
  },
  {
    title: 'Forward air spacing',
    focus:
      'Your back air spacing is good, but your forward air spacing needs more use and more retreating applications.',
    points: [
      'Most of your forward airs were approaching. That is not bad, but do not make it the only version.',
      'Use retreating fair more, especially against shorter-ish characters like Mario.',
      'Retreating fast-fall fair can still lead to dash attack conversions.',
      'Poke shield with retreating fair, stay outside burst range, then punish antsy out-of-shield options with nair or bair.',
    ],
    relatedTags: ['got-grabbed', 'shield-pressure'],
  },
  {
    title: 'Jump more in stressful air spots',
    focus:
      'You often brute force your way to the ground when simply jumping away would solve the situation.',
    points: [
      'Examples: after getting down thrown or down tilted at high percent, you got hit by something unnecessary because you did not recognize the jump option.',
      'Jumping away in weird, stressful scenarios can be better than always mashing a button or air dodge.',
    ],
    relatedTags: ['panic-option', 'could-not-land'],
  },
  {
    title: 'Platform usage',
    focus:
      'Use platforms more as a core part of advantage, disadvantage, movement, and survivability.',
    points: [
      'Shark with up airs beneath platforms.',
      'Use teleport cancels, movement mix-ups, and platform camping at high percent against certain characters to live longer.',
      'Use shield-pressure nairs and up airs, plus run-off fast-fall bair from platforms.',
      'Use short-hop up air on platforms much more for consistent platform tech chases.',
      'Scout for opponents who love jumping off platforms after shield pressure from nair or up air, then call out that jump with up air.',
    ],
    relatedTags: ['could-not-land', 'panic-option'],
  },
  {
    title: 'Mario up smash shield punish',
    focus:
      "You can true punish the back hit of Mario's up smash on shield with drop shield instant dash attack.",
    points: [
      'You have to be fast.',
      'Do not go for it if the up smash is charged.',
      "Mario's up smash is not as safe on shield as it seems; it is -19 on block.",
    ],
    relatedTags: ['shield-pressure'],
  },
  {
    title: 'Ledge option awareness',
    focus:
      "Pay closer attention to the opponent's position before choosing a ledge option.",
    points: [
      'Their positioning can be a dead giveaway for what they want.',
      'You can use that positioning to your advantage.',
      'You were getting killed by ledge often because you were not paying enough attention to this.',
    ],
    relatedTags: ['edgeguarded'],
  },
]
