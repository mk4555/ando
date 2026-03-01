'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Itinerary, Trip } from '@/lib/types'
import ItineraryView from './ItineraryView'
import Card from '@/components/ui/Card'

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
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-5 py-2.5 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg)] disabled:opacity-50"
          >
            {isGenerating ? 'Regenerating...' : 'Regenerate itinerary'}
          </button>
          {error && <p className="text-sm text-[var(--error)]">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <Card className="p-8 text-center">
      {isGenerating ? (
        <>
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--text)]" />
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
          <button
            onClick={handleGenerate}
            className="mt-6 rounded-lg bg-[var(--cta)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--cta-h)]"
          >
            Generate Itinerary
          </button>
        </>
      )}
    </Card>
  )
}
