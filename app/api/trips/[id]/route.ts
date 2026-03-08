import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { TripMetadata } from '@/lib/types'

// PATCH /api/trips/[id] — update trip metadata (e.g. flights)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership and get existing metadata
  const { data: existing } = await supabase
    .from('trips')
    .select('metadata')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

  const body = await req.json()
  const incomingMetadata: Partial<TripMetadata> = body.metadata ?? {}

  const merged: TripMetadata = {
    ...(existing.metadata as TripMetadata),
    ...incomingMetadata,
  }

  const { data: trip, error } = await supabase
    .from('trips')
    .update({ metadata: merged, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 })

  return NextResponse.json({ trip })
}
