import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_ROUTES = ['/auth/login', '/auth/register', '/select-school']

interface CookieOptions {
  name: string
  value: string
  options: { path?: string; maxAge?: number; domain?: string; secure?: boolean; httpOnly?: boolean; sameSite?: 'lax' | 'strict' | 'none' }
}

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: CookieOptions[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )

  const path = request.nextUrl.pathname
  const isApiRoute = path.startsWith('/api/') || request.headers.get('accept')?.includes('application/json')

  const isAuthRoute = AUTH_ROUTES.some(r => path.startsWith(r)) || 
    path === '/' || path.startsWith('/api/health') || path.startsWith('/api/auth/')

  if (AUTH_ROUTES.some(r => path.startsWith(r)) || path === '/' || path.startsWith('/api/health') || path.startsWith('/api/auth/')) {
    return NextResponse.next({ request })
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    if (path.startsWith('/api/') || request.headers.get('accept')?.includes('application/json')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  const { data: profile } = await supabase
    .from('User')
    .select('role, schoolId')
    .eq('id', user.id)
    .single()

  if (!profile) {
    if (path.startsWith('/api/') || request.headers.get('accept')?.includes('application/json')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const supabaseResponse = NextResponse.next({ request })

  if (profile.schoolId) supabaseResponse.headers.set('x-school-id', profile.schoolId)
  supabaseResponse.headers.set('x-user-role', profile.role)
  supabaseResponse.headers.set('x-user-id', user.id)

  const p = path

  if (p.startsWith('/admin') || p.startsWith('/api/admin')) {
    if (profile.role !== 'ADMIN') {
      if (p.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
    return supabaseResponse
  }

  if (p.startsWith('/driver') || p.startsWith('/api/driver')) {
    if (profile.role !== 'DRIVER') {
      if (p.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
    return supabaseResponse
  }

  if (p.startsWith('/parent') || p.startsWith('/api/parent')) {
    if (profile.role !== 'PARENT') {
      if (p.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
    return supabaseResponse
  }

  supabaseResponse.headers.set('x-user-role', profile.role)
  supabaseResponse.headers.set('x-user-id', user.id)
  if (profile.schoolId) supabaseResponse.headers.set('x-school-id', profile.schoolId)

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}