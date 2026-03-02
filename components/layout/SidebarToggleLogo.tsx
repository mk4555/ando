'use client'
import { useSidebar } from '@/components/ui/sidebar'

export default function SidebarToggleLogo() {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      onClick={toggleSidebar}
      aria-label="Expand sidebar"
      className="hidden h-14 w-full cursor-pointer items-center justify-center
                 border-b border-[var(--border)]
                 group-data-[collapsible=icon]:flex"
    >
      <span className="font-[var(--font-display)] text-[22px] font-medium text-[var(--accent)]">
        o
      </span>
    </button>
  )
}
