import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: trip } = await supabase
    .from('trips')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (!trip || trip.user_id !== user.id) redirect('/dashboard')

  return <>{children}</>
}
