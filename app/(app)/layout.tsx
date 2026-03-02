import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
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

  return (
    <QueryProvider>
      <SidebarProvider className="h-svh overflow-hidden">
        <Suspense>
          <AppSidebar />
        </Suspense>
        <SidebarInset>
          <header className="shrink-0 flex h-14 items-center border-b border-[var(--border)] bg-[var(--bg)] px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </QueryProvider>
  )
}
