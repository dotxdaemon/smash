// ABOUTME: Verifies presentation formatters for set dates and loss-tag labels.
// ABOUTME: Keeps display strings consistent and independent from the views.
import { describe, expect, it } from 'vitest'
import { formatSetDate, formatWinRate, labelForLossTag } from './format'

describe('formatSetDate', () => {
  it('formats an ISO timestamp into a short month/day time string', () => {
    const formatted = formatSetDate('2026-01-05T15:30:00.000Z')
    expect(formatted).toMatch(/Jan/)
    expect(formatted).toMatch(/\d/)
  })
})

describe('labelForLossTag', () => {
  it('returns the human label for a known tag', () => {
    expect(labelForLossTag('got-grabbed')).toBe('Got grabbed')
  })
})

describe('formatWinRate', () => {
  it('renders an em dash when there is no rate', () => {
    expect(formatWinRate(null)).toBe('—')
  })

  it('renders a rounded percentage', () => {
    expect(formatWinRate(0.5)).toBe('50%')
    expect(formatWinRate(2 / 3)).toBe('67%')
  })
})
