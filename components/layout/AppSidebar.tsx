import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
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
      <SidebarHeader>
        <TripSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav />
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-1 px-1 pb-1">
          <div className="flex items-center gap-2 px-2 py-1.5">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="h-6 w-6 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-s)] text-xs font-medium text-[var(--accent)]">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="truncate text-sm text-[var(--text-2)]">{displayName}</span>
          </div>
          <Link
            href="/onboarding"
            className="rounded-md px-2 py-1.5 text-sm text-[var(--text-2)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
          >
            Preferences
          </Link>
          <SignOutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
