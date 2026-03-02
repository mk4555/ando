import Link from 'next/link'
import { Settings } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import TripSwitcher from './TripSwitcher'
import SidebarNav from './SidebarNav'
import SignOutButton from './SignOutButton'

export default async function AppSidebar() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single()
    : { data: null }

  const displayName = profile?.display_name ?? user?.email ?? 'Traveler'

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-0 gap-0">
        {/* Logo row — matches public Navbar height */}
        <Link
          href="/dashboard"
          className="flex h-14 items-center border-b border-[var(--border)] px-4
                     font-[var(--font-display)] text-[22px] font-medium tracking-[-0.4px]
                     text-[var(--text)] no-underline
                     group-data-[collapsible=icon]:hidden"
        >
          and<span className="text-[var(--accent)]">o</span>
        </Link>
        {/* Compact logo for icon mode */}
        <div className="hidden h-14 items-center justify-center border-b border-[var(--border)]
                        group-data-[collapsible=icon]:flex">
          <span className="font-[var(--font-display)] text-[22px] font-medium text-[var(--accent)]">o</span>
        </div>
        <div className="px-2 py-2">
          <TripSwitcher />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* User info row */}
          <SidebarMenuItem>
            <SidebarMenuButton className="pointer-events-none">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-s)] text-xs font-medium text-[var(--accent)]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="truncate text-sm text-[var(--text-2)]">{displayName}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Preferences */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Preferences" className="cursor-pointer">
              <Link href="/onboarding">
                <Settings className="h-4 w-4" />
                <span>Preferences</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Sign out */}
          <SignOutButton />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
