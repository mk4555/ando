import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// YYYY-MM-DD string for today in UTC — used for server-side date validation
function todayUTCStr() {
  return new Date().toISOString().split('T')[0]
}

// GET /api/trips — list the authenticated user's non-archived trips with itinerary status
export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: trips, error } = await supabase
    .from('trips')
    .select('*, itineraries(is_active)')
    .eq('user_id', user.id)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })

  return NextResponse.json({ trips })
}

// POST /api/trips — create a new trip record (no generation triggered here)
export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    destination,
    title,
    start_date,
    end_date,
    traveler_count = 1,
    budget_total,
    currency = 'USD',
  } = body

  // Server-side validation — mirrors client rules exactly (Edge Case 004)
  if (!destination?.trim()) {
    return NextResponse.json({ error: 'Destination is required' }, { status: 400 })
  }
  if (!start_date || !end_date) {
    return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 })
  }
  if (start_date < todayUTCStr()) {
    return NextResponse.json({ error: 'Start date cannot be in the past' }, { status: 400 })
  }
  if (end_date < start_date) {
    return NextResponse.json({ error: 'End date must be on or after start date' }, { status: 400 })
  }

  // Max 14 days — keeps prompt size manageable and protects against Vercel timeout (Edge Case 005)
  const diffDays = Math.ceil(
    (new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diffDays > 13) {
    return NextResponse.json({ error: 'Trip must be 14 days or shorter' }, { status: 400 })
  }

  if (Number(traveler_count) < 1) {
    return NextResponse.json({ error: 'At least 1 traveler required' }, { status: 400 })
  }

  const { data: trip, error } = await supabase
    .from('trips')
    .insert({
      user_id:        user.id,
      destination:    destination.trim(),
      title:          title?.trim() || null,
      start_date,
      end_date,
      traveler_count: Number(traveler_count),
      budget_total:   budget_total ? Number(budget_total) : null,
      currency,
      status:         'draft',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })

  return NextResponse.json({ trip }, { status: 201 })
}
