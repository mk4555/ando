import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import ItineraryView from '@/components/itinerary/ItineraryView'
import type { Itinerary } from '@/lib/types'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function SharedTripPage({
  params,
}: {
  params: Promise<{ shareToken: string }>
}) {
  const { shareToken } = await params
  const supabase = await createServerClient()

  // No auth required — public SELECT policy allows this query
  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('share_token', shareToken)
    .maybeSingle()

  if (!trip) notFound()

  const { data: itinerary } = await supabase
    .from('itineraries')
    .select('*')
    .eq('trip_id', trip.id)
    .eq('is_active', true)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Ando brand */}
        <div className="mb-8 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-stone-900">ando</span>
          <Link
            href="/dashboard"
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            Plan my own trip
          </Link>
        </div>

        {/* Trip header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            {trip.destination}
          </h1>
          {trip.title && (
            <p className="mt-1 text-stone-500">{trip.title}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
            <span>
              {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
            </span>
            <span>·</span>
            <span>
              {trip.traveler_count}{' '}
              {trip.traveler_count === 1 ? 'traveler' : 'travelers'}
            </span>
            {trip.budget_total && (
              <>
                <span>·</span>
                <span>
                  {trip.currency} {Number(trip.budget_total).toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Itinerary (read-only) */}
        <div className="mt-10">
          {itinerary ? (
            <ItineraryView
              itinerary={itinerary as Itinerary}
              currency={trip.currency}
            />
          ) : (
            <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
              <p className="text-stone-500">
                This itinerary hasn&apos;t been generated yet.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-xl border border-stone-200 bg-white p-6 text-center">
          <p className="text-sm font-medium text-stone-700">
            Want Ando to plan your next trip?
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            Get started →
          </Link>
        </div>
      </div>
    </div>
  )
}
