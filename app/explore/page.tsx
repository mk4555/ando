import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { formatTripDateRange } from '@/lib/date'
import PageShell from '@/components/ui/PageShell'
import Card from '@/components/ui/Card'

export default async function ExplorePage() {
  const supabase = await createServerClient()
  const { data: trips } = await supabase
    .from('trips')
    .select('destination, title, start_date, end_date, traveler_count, budget_total, currency, share_token')
    .eq('visibility', 'public')
    .neq('status', 'archived')
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <PageShell maxWidth="3xl" paddingY="py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">
        Explore public trips
      </h1>
      <p className="mt-2 text-sm text-[var(--text-2)]">
        Discover itineraries published by the community.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {(trips ?? []).length === 0 ? (
          <Card className="p-8 text-center text-[var(--text-2)]">
            No public trips yet.
          </Card>
        ) : (
          (trips ?? []).map((trip, idx) => (
            <Link
              key={`${trip.share_token}-${idx}`}
              href={`/shared/${trip.share_token}`}
              className="block"
            >
              <Card className="p-6 transition-shadow hover:shadow-[var(--shadow-md)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-xl font-semibold text-[var(--text)]">{trip.destination}</p>
                    {trip.title && (
                      <p className="mt-0.5 truncate text-sm text-[var(--text-2)]">{trip.title}</p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--accent-s)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                    Public
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3 text-sm text-[var(--text-2)]">
                  <span>{formatTripDateRange(trip.start_date, trip.end_date)}</span>
                  <span>&middot;</span>
                  <span>
                    {trip.traveler_count} {trip.traveler_count === 1 ? 'traveler' : 'travelers'}
                  </span>
                  {trip.budget_total && (
                    <>
                      <span>&middot;</span>
                      <span>{trip.currency} {Number(trip.budget_total).toLocaleString()}</span>
                    </>
                  )}
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </PageShell>
  )
}
