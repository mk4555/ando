import { Suspense } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import AppSidebar from '@/components/layout/AppSidebar'
import QueryProvider from '@/components/providers/QueryProvider'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SidebarProvider>
        <Suspense>
          <AppSidebar />
        </Suspense>
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center px-4 border-b border-[var(--border)]">
            <SidebarTrigger />
          </header>
          <main className="flex-1">{children}</main>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </QueryProvider>
  )
}
