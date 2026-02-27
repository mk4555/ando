import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, onboarded')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarded) redirect('/onboarding')

  const name = profile.display_name ?? 'traveler'
  const firstName = name.split(' ')[0]

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Hey, {firstName}
        </h1>
        <p className="mt-2 text-stone-500">Where are you headed next?</p>

        <div className="mt-10">
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            Plan a new trip
          </Link>
        </div>
      </div>
    </div>
  )
}
