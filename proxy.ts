import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Start with a passthrough response that carries the request cookies forward.
  // The Supabase client may call setAll() to refresh the session token; when it
  // does we replace supabaseResponse so the updated cookies are forwarded.
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

  // IMPORTANT: always use getUser(), never getSession(), to avoid trusting
  // unverified JWT data from the client.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isPublicRoute =
    pathname === '/login' ||
    pathname === '/callback' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.match(/\.(ico|svg|png|jpg|jpeg|webp)$/)

  // Unauthenticated user hitting a protected route → send to login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated user hitting the login page → send to dashboard
  if (user && pathname === '/login') {
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
