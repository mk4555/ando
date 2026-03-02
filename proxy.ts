import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Keep route transitions cheap: do not verify auth on every request.
  // Protected app routes are gated in app/(app)/layout.tsx.
  if (pathname !== '/login') {
    return NextResponse.next({ request })
  }

  // Only the /login route needs an auth check to redirect signed-in users.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Run on all paths except Next.js internals and static files.
     * The regex below matches everything except _next/static, _next/image,
     * and files with a dot in the name (favicon.ico, etc.).
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
