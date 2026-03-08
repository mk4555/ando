'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Itinerary, Trip } from '@/lib/types'
import ItineraryView from './ItineraryView'
import Card from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/Spinner'

interface Props {
  trip: Trip
  itinerary: Itinerary | null
}

export default function ItinerarySection({ trip, itinerary }: Props) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/itineraries/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId: trip.id }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      router.refresh()
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (itinerary) {
    return (
      <div>
        <ItineraryView itinerary={itinerary} currency={trip.currency} />

        <div className="mt-8 flex flex-col items-start gap-2">
          <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Regenerating...' : 'Regenerate itinerary'}
          </Button>
          {error && <p className="text-sm text-[var(--error)]">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <Card className="p-10 text-center">
      {isGenerating ? (
        <>
          <Spinner className="mx-auto mb-4" />
          <p className="font-display text-lg font-medium text-[var(--text)]">Building your itinerary…</p>
          <p className="mt-1 text-sm text-[var(--text-3)]">
            Ando is crafting a personalised day-by-day plan. This takes about 15–30 seconds.
          </p>
        </>
      ) : (
        <>
          <svg
            className="mx-auto mb-4 h-12 w-12 text-[var(--accent)]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
            />
          </svg>
          <h3 className="font-display text-xl font-medium text-[var(--text)]">Ready to plan your trip?</h3>
          <p className="mt-2 text-sm text-[var(--text-2)]">
            Ando will generate a personalised day-by-day itinerary based on your trip details.
          </p>
          {error && (
            <p className="mt-2 text-sm text-[var(--error)]">{error}</p>
          )}
          <Button size="lg" onClick={handleGenerate} className="mt-6">
            Generate Itinerary
          </Button>
        </>
      )}
    </Card>
  )
}
