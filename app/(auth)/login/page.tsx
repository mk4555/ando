'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    })
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, sans-serif',
      color: '#5A6B82',
      fontSize: '15px',
    }}>
      Signing you in…
    </div>
  )
}
