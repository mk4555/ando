import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import type { Trip } from '@/lib/types'

interface AuthedTripResult {
  userId: string
  trip: Trip
}

export const getAuthedTrip = cache(async (tripId: string): Promise<AuthedTripResult> => {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()

  if (!trip || trip.user_id !== user.id) redirect('/dashboard')

  return { userId: user.id, trip: trip as Trip }
})
