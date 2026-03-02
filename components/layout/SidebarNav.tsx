'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

const APP_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'New Trip', href: '/trips/new', icon: '＋' },
  { label: 'Explore', href: '/explore', icon: '🌍' },
]

export default function SidebarNav() {
  const pathname = usePathname()
  const params = useParams()
  const tripId = params?.id as string | undefined

  const isTripRoute = !!tripId && pathname.includes(`/trips/${tripId}`)

  const TRIP_NAV = tripId
    ? [
        { label: 'Itinerary', href: `/trips/${tripId}/itinerary`, icon: '📅' },
        { label: 'Budget', href: `/trips/${tripId}/budget`, icon: '💰' },
        { label: 'Flights', href: `/trips/${tripId}/flight`, icon: '✈' },
        { label: 'Stays', href: `/trips/${tripId}/stay`, icon: '🏨' },
      ]
    : []

  if (isTripRoute) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Trip</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {TRIP_NAV.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <span aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {APP_NAV.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
