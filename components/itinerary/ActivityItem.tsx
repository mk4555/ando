import type { Activity } from '@/lib/types'

const CATEGORY_COLORS: Record<Activity['category'], string> = {
  attraction:    'bg-[var(--accent-s)] text-[var(--accent)]',
  restaurant:    'bg-orange-50 text-orange-600',
  transport:     'bg-[var(--bg-subtle)] text-[var(--text-2)]',
  accommodation: 'bg-emerald-50 text-emerald-700',
  experience:    'bg-violet-50 text-violet-600',
}

interface Props {
  activity: Activity
  currency: string
  isLast?: boolean
}

export default function ActivityItem({ activity, currency, isLast = false }: Props) {
  return (
    <div className="flex gap-3">
      {/* Time column */}
      <div className="w-14 shrink-0 pt-1 text-right text-xs font-medium text-[var(--text-3)]">
        {activity.time}
      </div>

      {/* Timeline column */}
      <div className="relative flex w-4 shrink-0 flex-col items-center">
        <div className="mt-1.5 h-2 w-2 rounded-full border border-[var(--border-hi)] bg-[var(--bg-card)]" />
        {!isLast && <div className="mt-1 w-px flex-1 bg-[var(--border)]" />}
      </div>

      {/* Content */}
      <div className={`flex-1 ${isLast ? 'pb-2' : 'pb-6'}`}>
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
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-xs text-[var(--text-3)]">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            <span className="capitalize">{activity.travel_to_next.mode}</span>
            <span>&middot;</span>
            <span>{activity.travel_to_next.duration_min} min</span>
          </div>
        )}
      </div>
    </div>
  )
}
