// ABOUTME: Provides a lightweight opponent character list for type-ahead selection.
// ABOUTME: Keeps MVP input fast without introducing remote lookups or APIs.
export const CHARACTERS = [
  'Mario',
  'Donkey Kong',
  'Link',
  'Samus',
  'Yoshi',
  'Kirby',
  'Fox',
  'Pikachu',
  'Luigi',
  'Ness',
  'Captain Falcon',
  'Jigglypuff',
  'Peach',
  'Bowser',
  'Ice Climbers',
  'Sheik',
  'Zelda',
  'Dr. Mario',
  'Pichu',
  'Falco',
  'Marth',
  'Young Link',
  'Ganondorf',
  'Mewtwo',
  'Roy',
  'Mr. Game & Watch',
] as const

const CHARACTER_BY_OPPONENT_NAME = new Map(
  CHARACTERS.map((character) => [opponentNameKey(character), character]),
)

export function canonicalizeOpponentName(opponent: string): string {
  const displayName = opponent.trim().replace(/\s+/g, ' ')

  return CHARACTER_BY_OPPONENT_NAME.get(opponentNameKey(displayName)) ?? displayName
}

function opponentNameKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}
