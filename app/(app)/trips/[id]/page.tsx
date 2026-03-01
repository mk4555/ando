import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import ItinerarySection from '@/components/itinerary/ItinerarySection'
import ShareButton from '@/components/trip/ShareButton'
import TripHeaderSummary from '@/components/trip/TripHeaderSummary'
import PageShell from '@/components/ui/PageShell'
import type { Itinerary } from '@/lib/types'

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single()

  if (!trip || trip.user_id !== user.id) redirect('/dashboard')

  const { data: itinerary } = await supabase
    .from('itineraries')
    .select('*')
    .eq('trip_id', id)
    .eq('is_active', true)
    .maybeSingle()

  return (
    <PageShell maxWidth="2xl" paddingY="py-12">
      <Link
        href="/dashboard"
        className="text-sm text-[var(--text-2)] hover:text-[var(--text)]"
      >
        ? My trips
      </Link>

      <div className="mt-6">
        <TripHeaderSummary
          destination={trip.destination}
          title={trip.title}
          startDate={trip.start_date}
          endDate={trip.end_date}
          travelerCount={trip.traveler_count}
          budgetTotal={trip.budget_total}
          currency={trip.currency}
        />
      </div>

      <div className="mt-10">
        <ItinerarySection trip={trip} itinerary={itinerary as Itinerary | null} />
      </div>

      <div className="mt-10 border-t border-[var(--border)] pt-6">
        <p className="text-xs text-[var(--text-3)]">
          Anyone with the link can view this itinerary in read-only mode.
        </p>
        <div className="mt-2">
          <ShareButton
            url={`${process.env.NEXT_PUBLIC_APP_URL}/shared/${trip.share_token}`}
          />
        </div>
      </div>
    </PageShell>
  )
}
