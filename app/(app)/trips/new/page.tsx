import TripForm from '@/components/trip/TripForm'
import PageShell from '@/components/ui/PageShell'

export default function NewTripPage() {
  return (
    <PageShell maxWidth="lg" paddingY="py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
          Plan a new trip
        </h1>
        <p className="mt-1 text-sm text-[var(--text-2)]">
          Ando will build your itinerary once you&apos;ve created the trip.
        </p>
      </div>
      <TripForm />
    </PageShell>
  )
}
