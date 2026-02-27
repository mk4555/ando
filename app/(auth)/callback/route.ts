import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Guarantee a profiles row exists immediately after every login.
        // ignoreDuplicates: true means this is a true no-op for returning users —
        // their onboarded flag is never reset. (Data Integrity Rule 1)
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            display_name: (user.user_metadata?.full_name as string) ?? null,
            avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
            onboarded: false,
          },
          { onConflict: 'id', ignoreDuplicates: true }
        )

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', user.id)
          .single()

        if (!profile || !profile.onboarded) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  // Something went wrong — send back to login with an error hint
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
