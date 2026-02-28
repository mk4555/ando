import type { Activity } from '@/lib/types'

const CATEGORY_COLORS: Record<Activity['category'], string> = {
  attraction:    'bg-blue-50 text-blue-700',
  restaurant:    'bg-amber-50 text-amber-700',
  transport:     'bg-stone-100 text-stone-600',
  accommodation: 'bg-purple-50 text-purple-700',
  experience:    'bg-emerald-50 text-emerald-700',
}

interface Props {
  activity: Activity
  currency: string
}

export default function ActivityItem({ activity, currency }: Props) {
  return (
    <div className="flex gap-4">
      {/* Time column */}
      <div className="w-14 shrink-0 pt-0.5 text-right text-xs font-medium text-stone-400">
        {activity.time}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-stone-900">{activity.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${CATEGORY_COLORS[activity.category]}`}
              >
                {activity.category}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-600">{activity.description}</p>
            {activity.notes && (
              <p className="mt-1 text-xs text-stone-400 italic">{activity.notes}</p>
            )}
          </div>
          {activity.cost_estimate > 0 && (
            <span className="shrink-0 text-sm text-stone-500">
              {currency} {activity.cost_estimate.toLocaleString()}
            </span>
          )}
        </div>

        {/* Travel to next */}
        {activity.travel_to_next && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-400">
            <span>→</span>
            <span>
              {activity.travel_to_next.mode} · {activity.travel_to_next.duration_min} min
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
