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
      <h1 className="font-display text-4xl font-medium tracking-tight text-[var(--text)]">
        {destination}
      </h1>
      {title && (
        <p className="mt-1 text-[var(--text-2)]">{title}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-2)]">
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
          </svg>
          {formatTripDate(startDate)} – {formatTripDate(endDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          {travelerCount} {travelerCount === 1 ? 'traveler' : 'travelers'}
        </span>
        {budgetTotal && (
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[var(--text-3)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            {currency} {Number(budgetTotal).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  )
}
