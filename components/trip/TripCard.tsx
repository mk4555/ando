import Link from 'next/link'
import type { Trip } from '@/lib/types'

export interface TripCardProps {
  trip: Trip & { itineraries: { is_active: boolean }[] }
}

function formatDateRange(start: string, end: string): string {
  // Append T00:00:00 to avoid UTC offset shifting the displayed date
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const mo: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }

  if (s.getFullYear() !== e.getFullYear()) {
    return (
      s.toLocaleDateString('en-US', { ...mo, year: 'numeric' }) +
      ' – ' +
      e.toLocaleDateString('en-US', { ...mo, year: 'numeric' })
    )
  }
  if (s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString('en-US', { month: 'short' })} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`
  }
  return (
    s.toLocaleDateString('en-US', mo) +
    ' – ' +
    e.toLocaleDateString('en-US', mo) +
    `, ${e.getFullYear()}`
  )
}

export default function TripCard({ trip }: TripCardProps) {
  const hasItinerary = trip.itineraries.some(i => i.is_active)

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold text-stone-900">{trip.destination}</p>
          {trip.title && (
            <p className="mt-0.5 truncate text-sm text-stone-500">{trip.title}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            hasItinerary
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-stone-100 text-stone-500'
          }`}
        >
          {hasItinerary ? 'Itinerary ready' : 'No itinerary'}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm text-stone-500">
        <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
        <span>·</span>
        <span>
          {trip.traveler_count} {trip.traveler_count === 1 ? 'traveler' : 'travelers'}
        </span>
      </div>
    </Link>
  )
}
