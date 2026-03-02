import Link from 'next/link'
import { Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import TripSwitcher from './TripSwitcher'
import SidebarNav from './SidebarNav'
import SignOutButton from './SignOutButton'
import SidebarToggleLogo from './SidebarToggleLogo'

interface SidebarProfile {
  display_name: string | null
  avatar_url: string | null
}

interface AppSidebarProps {
  userEmail: string | null
  profile: SidebarProfile | null
}

export default function AppSidebar({ userEmail, profile }: AppSidebarProps) {

  const displayName = profile?.display_name ?? userEmail ?? 'Traveler'

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-0 gap-0">
        {/* Logo row — matches public Navbar height */}
        <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4
                        group-data-[collapsible=icon]:hidden">
          <Link
            href="/"
            className="font-[var(--font-display)] text-[22px] font-medium tracking-[-0.4px]
                       text-[var(--text)] no-underline"
          >
            and<span className="text-[var(--accent)]">o</span>
          </Link>
          <SidebarTrigger />
        </div>
        {/* Compact logo for icon mode — clicking expands the sidebar */}
        <SidebarToggleLogo />
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
