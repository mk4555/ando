import Link from 'next/link'
import type { Trip } from '@/lib/types'
import { formatTripDateRange } from '@/lib/date'

export interface TripCardProps {
  trip: Trip & { itineraries: { is_active: boolean }[] }
}

export default function TripCard({ trip }: TripCardProps) {
  const hasItinerary = trip.itineraries.some(i => i.is_active)

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-shadow hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold text-[var(--text)]">{trip.destination}</p>
          {trip.title && (
            <p className="mt-0.5 truncate text-sm text-[var(--text-2)]">{trip.title}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            hasItinerary
              ? 'bg-[var(--accent-s)] text-[var(--accent)]'
              : 'bg-[var(--bg-subtle)] text-[var(--text-2)]'
          }`}
        >
          {hasItinerary ? 'Itinerary ready' : 'No itinerary'}
        </span>
      </div>

      <div className="mt-4 text-sm text-[var(--text-2)]">
        <span>{formatTripDateRange(trip.start_date, trip.end_date)}</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-full px-2.5 py-1 text-xs font-medium bg-[var(--bg-subtle)] text-[var(--text-2)]">
          {trip.traveler_count} {trip.traveler_count === 1 ? 'traveler' : 'travelers'}
        </span>
        {trip.budget_total != null && (
          <span className="rounded-full px-2.5 py-1 text-xs font-medium bg-[var(--bg-subtle)] text-[var(--text-2)]">
            {new Intl.NumberFormat('en', { style: 'currency', currency: trip.currency, maximumFractionDigits: 0 }).format(trip.budget_total)}
          </span>
        )}
        <span className="rounded-full px-2.5 py-1 text-xs font-medium bg-[var(--bg-subtle)] text-[var(--text-2)] capitalize">
          {trip.visibility}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
            trip.status === 'active'
              ? 'bg-[var(--accent-s)] text-[var(--accent)]'
              : 'bg-[var(--bg-subtle)] text-[var(--text-2)]'
          }`}
        >
          {trip.status}
        </span>
      </div>
    </Link>
  )
}

