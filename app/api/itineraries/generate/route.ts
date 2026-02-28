import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai/client'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/openai/prompts'

export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let tripId: string
  try {
    const body = await req.json()
    tripId = body.tripId
    if (!tripId) return NextResponse.json({ error: 'tripId is required' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Fetch trip — also verifies ownership
  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()

  if (!trip || trip.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Fetch user profile for personalization
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Call OpenAI — synchronous at this scale
  let days: unknown[]
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user',   content: buildUserPrompt(trip, profile) },
      ],
    })

    const content = completion.choices[0].message.content
    if (!content) throw new Error('Empty response from OpenAI')

    const parsed = JSON.parse(content)
    if (!Array.isArray(parsed.days)) throw new Error('Invalid itinerary format')
    days = parsed.days
  } catch (err) {
    console.error('OpenAI generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate itinerary. Please try again.' },
      { status: 502 }
    )
  }

  // Deactivate previous versions
  await supabase
    .from('itineraries')
    .update({ is_active: false })
    .eq('trip_id', tripId)

  // Save new itinerary
  const { data: itinerary, error: insertError } = await supabase
    .from('itineraries')
    .insert({
      trip_id:  tripId,
      ai_model: 'gpt-4o',
      days,
      is_active: true,
    })
    .select()
    .single()

  if (insertError || !itinerary) {
    console.error('Itinerary insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save itinerary.' }, { status: 500 })
  }

  return NextResponse.json({ itinerary })
}
