import type { Activity } from '@/lib/types'

const CATEGORY_COLORS: Record<Activity['category'], string> = {
  attraction:    'bg-[var(--bg-subtle)] text-[var(--accent)]',
  restaurant:    'bg-[var(--bg-subtle)] text-[var(--cta)]',
  transport:     'bg-[var(--bg-subtle)] text-[var(--text-2)]',
  accommodation: 'bg-[var(--bg-subtle)] text-[var(--text)]',
  experience:    'bg-[var(--bg-subtle)] text-[var(--accent-h)]',
}

interface Props {
  activity: Activity
  currency: string
}

export default function ActivityItem({ activity, currency }: Props) {
  return (
    <div className="flex gap-4">
      {/* Time column */}
      <div className="w-14 shrink-0 pt-0.5 text-right text-xs font-medium text-[var(--text-3)]">
        {activity.time}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[var(--text)]">{activity.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${CATEGORY_COLORS[activity.category]}`}
              >
                {activity.category}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--text-2)]">{activity.description}</p>
            {activity.notes && (
              <p className="mt-1 text-xs text-[var(--text-3)] italic">{activity.notes}</p>
            )}
          </div>
          {activity.cost_estimate > 0 && (
            <span className="shrink-0 text-sm text-[var(--text-2)]">
              {currency} {activity.cost_estimate.toLocaleString()}
            </span>
          )}
        </div>

        {/* Travel to next */}
        {activity.travel_to_next && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-3)]">
            <span>→</span>
            <span>
              {activity.travel_to_next.mode} &middot; {activity.travel_to_next.duration_min} min
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
