import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TripHeaderSummary from './TripHeaderSummary'

describe('TripHeaderSummary', () => {
  it('renders title, date range, and travelers', () => {
    render(
      <TripHeaderSummary
        destination="Tokyo"
        title="Spring Trip"
        startDate="2026-03-10"
        endDate="2026-03-14"
        travelerCount={2}
        budgetTotal={3000}
        currency="USD"
      />
    )

    expect(screen.getByText('Tokyo')).toBeInTheDocument()
    expect(screen.getByText('Spring Trip')).toBeInTheDocument()
    expect(screen.getByText(/March 10, 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/2 travelers/i)).toBeInTheDocument()
    expect(screen.getByText(/USD 3,000/i)).toBeInTheDocument()
  })
})
