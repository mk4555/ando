'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Luggage, ChevronsUpDown } from 'lucide-react'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Trip } from '@/lib/types'

function tripLabel(trip: Trip): string {
  const name = trip.title || trip.destination
  return trip.country_code ? `${name} - ${trip.country_code}` : name
}

async function fetchTrips(): Promise<Trip[]> {
  const res = await fetch('/api/trips')
  if (!res.ok) return []
  const data = await res.json()
  return data.trips ?? []
}

export default function TripSwitcher() {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const currentTripId = params?.id as string | undefined

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: fetchTrips,
  })

  const currentTrip = trips.find((t) => t.id === currentTripId)

  // When switching trips, preserve the sub-path segment if we're in a trip route
  function getSubPath(): string {
    if (!currentTripId) return 'itinerary'
    const match = pathname.match(/\/trips\/[^/]+\/(.+)/)
    return match ? match[1] : 'itinerary'
  }

  function navigateToTrip(tripId: string) {
    router.push(`/trips/${tripId}/${getSubPath()}`)
  }

  const label = currentTrip ? tripLabel(currentTrip) : 'My Trips'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip={label} className="cursor-pointer font-medium">
              <Luggage className="hidden h-4 w-4 shrink-0 group-data-[collapsible=icon]:block" />
              <span className="truncate group-data-[collapsible=icon]:hidden">{label}</span>
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" className="w-56">
            {trips.map((trip) => (
              <DropdownMenuItem
                key={trip.id}
                onSelect={() => navigateToTrip(trip.id)}
                className={`cursor-pointer${trip.id === currentTripId ? ' font-medium' : ''}`}
              >
                <span className="truncate">{tripLabel(trip)}</span>
              </DropdownMenuItem>
            ))}
            {trips.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem onSelect={() => router.push('/trips/new')} className="cursor-pointer">
              <span className="text-[var(--accent)]">＋ New trip</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
