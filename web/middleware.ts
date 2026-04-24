import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Public routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
]

/**
 * Middleware to protect routes and handle authentication
 * Redirects unauthenticated users to login page
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session and trying to access protected route, redirect to login
    if (!session && pathname !== '/') {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // If authenticated and trying to access auth pages, redirect to dashboard
    if (session && publicRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
