import { getAuthedTrip } from '@/lib/trips/server'

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await getAuthedTrip(id)

  return <>{children}</>
}
