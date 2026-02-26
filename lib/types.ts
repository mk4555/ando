export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  travel_style: TravelStyle
  preferences: TravelPreferences
  onboarded: boolean
  created_at: string
  updated_at: string
}

export interface TravelStyle {
  pace?: 'slow' | 'medium' | 'fast'
  budget?: 'budget' | 'mid' | 'luxury'
  interests?: string[]
}

export interface TravelPreferences {
  dietary?: string[]
  accessibility?: string[]
  accommodation?: 'hostel' | 'hotel' | 'airbnb'
}

export interface Trip {
  id: string
  user_id: string
  title: string | null
  destination: string
  country_code: string | null
  start_date: string
  end_date: string
  traveler_count: number
  budget_total: number | null
  currency: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Itinerary {
  id: string
  trip_id: string
  version: number
  generated_at: string
  ai_model: string | null
  prompt_hash: string | null
  days: ItineraryDay[]
  is_active: boolean
}

export interface ItineraryDay {
  day: number
  date: string
  theme: string
  walking_km: number
  estimated_cost: number
  activities: Activity[]
}

export interface Activity {
  time: string
  duration_min: number
  name: string
  category: 'attraction' | 'restaurant' | 'transport' | 'accommodation' | 'experience'
  description: string
  notes: string | null
  cost_estimate: number
  travel_to_next: TravelSegment | null
}

export interface TravelSegment {
  mode: string
  duration_min: number
}
