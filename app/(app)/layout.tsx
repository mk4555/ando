import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import AppSidebar from '@/components/layout/AppSidebar'
import QueryProvider from '@/components/providers/QueryProvider'
import { createServerClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <QueryProvider>
      <SidebarProvider className="h-svh overflow-hidden">
        <Suspense>
          <AppSidebar userEmail={user.email ?? null} profile={profile ?? null} />
        </Suspense>
        <SidebarInset>
          <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </QueryProvider>
  )
}
