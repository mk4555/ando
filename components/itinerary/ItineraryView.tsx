import type { Itinerary } from '@/lib/types'
import DayCard from './DayCard'

interface Props {
  itinerary: Itinerary
  currency: string
}

export default function ItineraryView({ itinerary, currency }: Props) {
  const totalCost = itinerary.days.reduce((sum, d) => sum + (d.estimated_cost ?? 0), 0)

  return (
    <div>
      {/* Summary bar */}
      {totalCost > 0 && (
        <div className="mb-6 flex items-center gap-2 text-sm text-stone-500">
          <span>Estimated total</span>
          <span className="font-semibold text-stone-900">
            {currency} {totalCost.toLocaleString()}
          </span>
        </div>
      )}

      {/* Day cards */}
      <div className="flex flex-col gap-6">
        {itinerary.days.map(day => (
          <DayCard key={day.day} day={day} currency={currency} />
        ))}
      </div>
    </div>
  )
}
