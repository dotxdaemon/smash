// ABOUTME: Formats set dates and loss-tag labels for display.
// ABOUTME: Keeps presentation strings consistent across the views.
import { LOSS_TAGS } from './training'
import type { LossTag } from '../types'

const SET_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatSetDate(iso: string): string {
  return SET_DATE_FORMAT.format(new Date(iso))
}

export function labelForLossTag(tag: LossTag): string {
  return LOSS_TAGS.find((item) => item.id === tag)?.label ?? tag
}

export function formatWinRate(winRate: number | null): string {
  return winRate === null ? '—' : `${Math.round(winRate * 100)}%`
}
