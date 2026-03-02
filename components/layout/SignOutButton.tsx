'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full rounded-md px-2 py-1.5 text-left text-sm text-[var(--text-2)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
    >
      Sign out
    </button>
  )
}
