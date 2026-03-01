'use client'

import { useEffect } from 'react'
import { signInWithGoogle } from '@/lib/auth/signInWithGoogle'

export default function LoginPage() {
  useEffect(() => {
    signInWithGoogle()
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
