import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import TripCard from '@/components/trip/TripCard'
import PageShell from '@/components/ui/PageShell'
import { Button } from '@/components/ui/button'
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
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-3)]">Dashboard</p>
          <h1 className="font-display text-4xl font-medium tracking-tight text-[var(--text)]">
            Hey, {firstName}
          </h1>
        </div>
        <Button asChild size="default">
          <Link href="/trips/new">New trip</Link>
        </Button>
      </div>

      <div className="mt-10">
        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-[var(--text-3)]">Your trips</p>
        {tripList.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[var(--border)] p-12 text-center">
            <svg
              className="mx-auto mb-4 h-10 w-10 text-[var(--text-3)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
            <p className="font-medium text-[var(--text-2)]">No trips planned yet.</p>
            <p className="mt-1 text-sm text-[var(--text-3)]">Start by adding your next destination.</p>
            <Button asChild size="sm" className="mt-5">
              <Link href="/trips/new">Plan your first trip</Link>
            </Button>
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
