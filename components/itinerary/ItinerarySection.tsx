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
    <Card className="p-8 text-center">
      {isGenerating ? (
        <>
          <Spinner className="mx-auto mb-4" />
          <p className="text-[var(--text-2)]">Ando is planning your trip...</p>
          <p className="mt-1 text-sm text-[var(--text-3)]">This usually takes 15-30 seconds.</p>
        </>
      ) : (
        <>
          <p className="text-[var(--text-2)]">
            Your itinerary hasn&apos;t been generated yet.
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
