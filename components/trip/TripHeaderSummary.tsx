import { formatTripDate } from '@/lib/date'

interface TripHeaderSummaryProps {
  destination: string
  title: string | null
  startDate: string
  endDate: string
  travelerCount: number
  budgetTotal: number | null
  currency: string
}

export default function TripHeaderSummary({
  destination,
  title,
  startDate,
  endDate,
  travelerCount,
  budgetTotal,
  currency,
}: TripHeaderSummaryProps) {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">
        {destination}
      </h1>
      {title && (
        <p className="mt-1 text-[var(--text-2)]">{title}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-2)]">
        <span>
          {formatTripDate(startDate)} - {formatTripDate(endDate)}
        </span>
        <span>·</span>
        <span>
          {travelerCount} {travelerCount === 1 ? 'traveler' : 'travelers'}
        </span>
        {budgetTotal && (
          <>
            <span>·</span>
            <span>
              {currency} {Number(budgetTotal).toLocaleString()}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
