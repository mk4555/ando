import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

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

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link
          href="/dashboard"
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          ← My trips
        </Link>

        <div className="mt-6">
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

        {/* Itinerary section — placeholder until Step 5 wires up generation */}
        <div className="mt-10 rounded-xl border border-stone-200 bg-white p-8 text-center">
          <p className="text-stone-500">
            Your itinerary will appear here once generated.
          </p>
          <button
            disabled
            className="mt-6 cursor-not-allowed rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white opacity-40"
          >
            Generate Itinerary
          </button>
          <p className="mt-3 text-xs text-stone-400">Coming in the next update.</p>
        </div>
      </div>
    </div>
  )
}
