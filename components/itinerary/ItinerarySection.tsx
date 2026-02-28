'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Itinerary, Trip } from '@/lib/types'
import ItineraryView from './ItineraryView'

interface Props {
  trip: Trip
  itinerary: Itinerary | null
}

export default function ItinerarySection({ trip, itinerary }: Props) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setIsGenerating(true)  // Edge Case 003: set immediately on click
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

      // Re-run the server component to pick up the new itinerary
      router.refresh()
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsGenerating(false)  // Edge Case 003: always reset in finally
    }
  }

  if (itinerary) {
    return (
      <div>
        <ItineraryView itinerary={itinerary} currency={trip.currency} />

        {/* Regenerate */}
        <div className="mt-8 flex flex-col items-start gap-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="rounded-lg border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50"
          >
            {isGenerating ? 'Regenerating…' : 'Regenerate itinerary'}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    )
  }

  // No itinerary yet — show Generate button
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
      {isGenerating ? (
        <>
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />
          <p className="text-stone-600">Ando is planning your trip…</p>
          <p className="mt-1 text-sm text-stone-400">This usually takes 15–30 seconds.</p>
        </>
      ) : (
        <>
          <p className="text-stone-500">
            Your itinerary hasn&apos;t been generated yet.
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <button
            onClick={handleGenerate}
            className="mt-6 rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            Generate Itinerary
          </button>
        </>
      )}
    </div>
  )
}
