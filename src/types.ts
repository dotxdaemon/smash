export interface SetEntry {
  id: string
  date: string
  opponent: string
  yourCharacter?: string
  result: 'win' | 'loss'
  notes?: string
}
