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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      {/* Day header */}
      <div className="border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center rounded-full bg-[var(--accent-s)] px-2.5 py-0.5 text-xs font-bold text-[var(--accent)]">
              Day {day.day}
            </span>
            <h3 className="mt-1 font-display text-lg font-semibold text-[var(--text)]">
              {day.theme}
            </h3>
            <p className="mt-0.5 text-sm text-[var(--text-2)]">{formatDayDate(day.date)}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-[var(--text-3)]">Est. spend</p>
            <p className="text-sm font-medium text-[var(--text)]">
              {currency} {day.estimated_cost.toLocaleString()}
            </p>
            {day.walking_km > 0 && (
              <p className="mt-0.5 text-xs text-[var(--text-3)]">{day.walking_km} km walking</p>
            )}
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="px-6 pt-5">
        {day.activities.map((activity, i) => (
          <ActivityItem key={i} activity={activity} currency={currency} isLast={i === day.activities.length - 1} />
        ))}
      </div>
    </div>
  )
}
