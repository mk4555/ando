import TripForm from '@/components/trip/TripForm'

export default function NewTripPage() {
  return (
    <div className="min-h-screen bg-stone-50 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Plan a new trip
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Ando will build your itinerary once you&apos;ve created the trip.
          </p>
        </div>
        <TripForm />
      </div>
    </div>
  )
}
