// ABOUTME: Defines the locally saved Smash set record fields.
// ABOUTME: Keeps training summaries and storage validation aligned.
export type LossTag =
  | 'got-grabbed'
  | 'could-not-land'
  | 'missed-kill'
  | 'shield-pressure'
  | 'edgeguarded'
  | 'panic-option'

export interface SetEntry {
  id: string
  date: string
  opponent: string
  yourCharacter?: string
  result: 'win' | 'loss'
  notes?: string
  lossTags?: LossTag[]
}
