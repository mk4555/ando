import { describe, expect, it } from 'vitest'
import { formatTripDate, formatTripDateRange } from './date'

describe('date formatting helpers', () => {
  it('formats a single trip date in en-US format', () => {
    expect(formatTripDate('2026-03-02')).toBe('March 2, 2026')
  })

  it('formats a trip date range in the same month', () => {
    expect(formatTripDateRange('2026-03-02', '2026-03-05')).toBe('Mar 2-5, 2026')
  })
})
