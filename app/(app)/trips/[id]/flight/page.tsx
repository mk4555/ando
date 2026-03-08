import { getAuthedTrip } from '@/lib/trips/server'
import FlightPageForm from '@/components/trip/FlightPageForm'

export default async function FlightPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { trip } = await getAuthedTrip(id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-[var(--text)]">
        Flight details
      </h1>
      <FlightPageForm
        tripId={trip.id}
        initialFlights={trip.metadata.flights ?? {}}
      />
    </div>
  )
}
