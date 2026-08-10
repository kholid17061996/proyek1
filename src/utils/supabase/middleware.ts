import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/login')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/pengajar')

  if (!user && isProtectedRoute) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Jika user sudah login, kita cek role-nya untuk pengalihan (akan ditambahkan lebih lanjut)
  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile) {
      const url = request.nextUrl.clone()
      if (profile.role === 'admin') {
        url.pathname = '/admin'
      } else if (profile.role === 'pengajar') {
        url.pathname = '/pengajar'
      } else {
        url.pathname = '/'
      }
      return NextResponse.redirect(url)
    }
  }

  // Proteksi Rute berdasarkan role (mencegah pengajar masuk /admin)
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile) {
      const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
      const isPengajarRoute = request.nextUrl.pathname.startsWith('/pengajar')

      if (isAdminRoute && profile.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = profile.role === 'pengajar' ? '/pengajar' : '/'
        return NextResponse.redirect(url)
      }

      if (isPengajarRoute && profile.role !== 'pengajar' && profile.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
