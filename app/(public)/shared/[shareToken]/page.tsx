import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import ItineraryView from '@/components/itinerary/ItineraryView'
import TripHeaderSummary from '@/components/trip/TripHeaderSummary'
import PageShell from '@/components/ui/PageShell'
import Card from '@/components/ui/Card'
import type { Itinerary } from '@/lib/types'

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
    <PageShell maxWidth="2xl" paddingY="py-12">
      <div className="mb-8 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight text-[var(--text)]">ando</span>
        <Link
          href="/dashboard"
          className="rounded-lg bg-[var(--cta)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--cta-h)]"
        >
          Plan my own trip
        </Link>
      </div>

      <TripHeaderSummary
        destination={trip.destination}
        title={trip.title}
        startDate={trip.start_date}
        endDate={trip.end_date}
        travelerCount={trip.traveler_count}
        budgetTotal={trip.budget_total}
        currency={trip.currency}
      />

      <div className="mt-10">
        {trip.itinerary ? (
          <ItineraryView
            itinerary={trip.itinerary}
            currency={trip.currency}
          />
        ) : (
          <Card className="p-8 text-center">
            <p className="text-[var(--text-2)]">
              This itinerary hasn&apos;t been generated yet.
            </p>
          </Card>
        )}
      </div>

      <Card className="mt-12 p-6 text-center">
        <p className="text-sm font-medium text-[var(--text)]">
          Want Ando to plan your next trip?
        </p>
        <Link
          href="/dashboard"
          className="mt-3 inline-block rounded-lg bg-[var(--cta)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--cta-h)]"
        >
          Get started ?
        </Link>
      </Card>
    </PageShell>
  )
}
