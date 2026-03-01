import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import TripCard from '@/components/trip/TripCard'
import PageShell from '@/components/ui/PageShell'
import type { Trip } from '@/lib/types'

type TripWithItinerary = Trip & { itineraries: { is_active: boolean }[] }

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, onboarded')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarded) redirect('/onboarding')

  const { data: trips } = await supabase
    .from('trips')
    .select('*, itineraries(is_active)')
    .eq('user_id', user.id)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  const name = profile.display_name ?? 'traveler'
  const firstName = name.split(' ')[0]
  const tripList = (trips ?? []) as TripWithItinerary[]

  return (
    <PageShell maxWidth="2xl" paddingY="py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">
          Hey, {firstName}
        </h1>
        <Link
          href="/trips/new"
          className="rounded-lg bg-[var(--cta)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--cta-h)]"
        >
          New trip
        </Link>
      </div>

      <div className="mt-10">
        {tripList.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[var(--border)] p-12 text-center">
            <p className="text-[var(--text-2)]">No trips yet.</p>
            <Link
              href="/trips/new"
              className="mt-4 inline-block text-sm font-medium text-[var(--text)] underline underline-offset-4"
            >
              Plan your first trip
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tripList.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
