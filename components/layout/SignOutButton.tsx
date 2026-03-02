'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={handleSignOut} tooltip="Sign out" className="cursor-pointer">
        <LogOut className="h-4 w-4" />
        <span>Sign out</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
