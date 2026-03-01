'use client'

import { createClient } from '@/lib/supabase/client'

interface Props {
  className?: string
  children: React.ReactNode
}

export default function SignInButton({ className, children }: Props) {
  async function signIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    })
  }

  return (
    <button onClick={signIn} className={className}>
      {children}
    </button>
  )
}
