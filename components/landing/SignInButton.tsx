'use client'

import { signInWithGoogle } from '@/lib/auth/signInWithGoogle'

interface Props {
  className?: string
  children: React.ReactNode
}

export default function SignInButton({ className, children }: Props) {
  async function signIn() {
    await signInWithGoogle()
  }

  return (
    <button onClick={signIn} className={className}>
      {children}
    </button>
  )
}
