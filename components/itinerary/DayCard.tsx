import type { ItineraryDay } from '@/lib/types'
import ActivityItem from './ActivityItem'

interface Props {
  day: ItineraryDay
  currency: string
}

function formatDayDate(dateStr: string): string {
  // T00:00:00 prevents UTC offset from shifting the displayed date (Edge Case 008)
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
  })
}

export default function DayCard({ day, currency }: Props) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white">
      {/* Day header */}
      <div className="border-b border-stone-100 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Day {day.day}
            </p>
            <h3 className="mt-0.5 text-base font-semibold text-stone-900">
              {day.theme}
            </h3>
            <p className="mt-0.5 text-sm text-stone-500">{formatDayDate(day.date)}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-stone-400">Est. spend</p>
            <p className="text-sm font-medium text-stone-700">
              {currency} {day.estimated_cost.toLocaleString()}
            </p>
            {day.walking_km > 0 && (
              <p className="mt-0.5 text-xs text-stone-400">{day.walking_km} km walking</p>
            )}
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="px-6 pt-5">
        {day.activities.map((activity, i) => (
          <ActivityItem key={i} activity={activity} currency={currency} />
        ))}
      </div>
    </div>
  )
}
