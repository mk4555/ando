'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { LayoutDashboard, Plus, Compass, CalendarDays, Wallet, Plane, BedDouble } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

const APP_NAV: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: 'Dashboard', href: '/dashboard', Icon: LayoutDashboard },
  { label: 'New Trip', href: '/trips/new', Icon: Plus },
  { label: 'Explore', href: '/explore', Icon: Compass },
]

export default function SidebarNav() {
  const pathname = usePathname()
  const params = useParams()
  const tripId = params?.id as string | undefined

  const isTripRoute = !!tripId && pathname.includes(`/trips/${tripId}`)

  const TRIP_NAV: { label: string; href: string; Icon: LucideIcon }[] = tripId
    ? [
        { label: 'Itinerary', href: `/trips/${tripId}/itinerary`, Icon: CalendarDays },
        { label: 'Budget', href: `/trips/${tripId}/budget`, Icon: Wallet },
        { label: 'Flights', href: `/trips/${tripId}/flight`, Icon: Plane },
        { label: 'Stays', href: `/trips/${tripId}/stay`, Icon: BedDouble },
      ]
    : []

  const navItems = isTripRoute ? TRIP_NAV : APP_NAV
  const groupLabel = isTripRoute ? 'Trip' : 'Navigation'

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map(({ label, href, Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton asChild isActive={pathname === href}>
                <Link href={href}>
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
