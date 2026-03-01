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

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

interface SharedTripRow {
  trip_id: string
  destination: string
  title: string | null
  start_date: string
  end_date: string
  traveler_count: number
  budget_total: number | null
  currency: string
  itinerary: Itinerary | null
}

export default async function SharedTripPage({
  params,
}: {
  params: Promise<{ shareToken: string }>
}) {
  const { shareToken } = await params
  if (!isUuid(shareToken)) notFound()

  const supabase = await createServerClient()

  const { data, error } = await supabase.rpc('get_shared_trip', {
    p_share_token: shareToken,
  })

  if (error || !data || data.length === 0) notFound()
  const trip = data[0] as SharedTripRow

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Ando brand */}
        <div className="mb-8 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-[var(--text)]">ando</span>
          <Link
            href="/dashboard"
            className="rounded-lg bg-[var(--cta)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--cta-h)]"
          >
            Plan my own trip
          </Link>
        </div>

        {/* Trip header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">
            {trip.destination}
          </h1>
          {trip.title && (
            <p className="mt-1 text-[var(--text-2)]">{trip.title}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-2)]">
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
          {trip.itinerary ? (
            <ItineraryView
              itinerary={trip.itinerary}
              currency={trip.currency}
            />
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
              <p className="text-[var(--text-2)]">
                This itinerary hasn&apos;t been generated yet.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center">
          <p className="text-sm font-medium text-[var(--text)]">
            Want Ando to plan your next trip?
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block rounded-lg bg-[var(--cta)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--cta-h)]"
          >
            Get started →
          </Link>
        </div>
      </div>
    </div>
  )
}
