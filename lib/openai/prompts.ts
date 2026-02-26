import type { Trip, Profile } from '@/lib/types'

export function buildSystemPrompt(): string {
  return `You are Ando, a world-class travel planner.
Generate practical, personalized day-by-day travel itineraries.

Rules:
- Respect the traveler's pace (slow = 2-3 activities/day, medium = 3-4, fast = 5+)
- Account for realistic travel time between activities
- Include specific cost estimates in the user's currency
- Flag any booking requirements (skip-the-line tickets, reservations)
- Meals must respect dietary restrictions
- Include a daily theme and walking distance estimate

Output ONLY valid JSON in this exact format:
{
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "string",
      "walking_km": number,
      "estimated_cost": number,
      "activities": [
        {
          "time": "HH:MM",
          "duration_min": number,
          "name": "string",
          "category": "attraction|restaurant|transport|accommodation|experience",
          "description": "string",
          "notes": "string or null",
          "cost_estimate": number,
          "travel_to_next": { "mode": "string", "duration_min": number } or null
        }
      ]
    }
  ]
}`
}

export function buildUserPrompt(trip: Trip, profile: Profile): string {
  const days = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime())
    / (1000 * 60 * 60 * 24)
  ) + 1

  return `Create a ${days}-day itinerary for ${trip.destination}.

Traveler profile:
- Budget level: ${profile.travel_style?.budget ?? 'mid'}
- Total budget: ${trip.budget_total ? `${trip.currency} ${trip.budget_total}` : 'not specified'}
- Travel pace: ${profile.travel_style?.pace ?? 'medium'}
- Interests: ${(profile.travel_style?.interests ?? []).join(', ') || 'general sightseeing'}
- Dietary restrictions: ${(profile.preferences?.dietary ?? []).join(', ') || 'none'}
- Travelers: ${trip.traveler_count}
- Accommodation type: ${profile.preferences?.accommodation ?? 'hotel'}

Trip dates: ${trip.start_date} to ${trip.end_date}
Currency: ${trip.currency}`
}
