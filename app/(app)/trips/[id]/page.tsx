import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import ItinerarySection from '@/components/itinerary/ItinerarySection'
import ShareButton from '@/components/trip/ShareButton'
import type { Itinerary } from '@/lib/types'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

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

  // Redirect if trip not found or doesn't belong to this user
  if (!trip || trip.user_id !== user.id) redirect('/dashboard')

  // Fetch the active itinerary if one exists
  const { data: itinerary } = await supabase
    .from('itineraries')
    .select('*')
    .eq('trip_id', id)
    .eq('is_active', true)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link
          href="/dashboard"
          className="text-sm text-[var(--text-2)] hover:text-[var(--text)]"
        >
          ← My trips
        </Link>

        <div className="mt-6">
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

        <div className="mt-10">
          <ItinerarySection trip={trip} itinerary={itinerary as Itinerary | null} />
        </div>

        {/* Share link */}
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
      </div>
    </div>
  )
}
