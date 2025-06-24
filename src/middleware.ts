
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_EMAIL, USER_COOKIE } from '@/lib/auth-constants';

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get(USER_COOKIE);
  const { pathname } = request.nextUrl;

  const loginUrl = new URL('/login', request.url);
  const homeUrl = new URL('/', request.url);
  const adminUrl = new URL('/admin', request.url);

  // If trying to access protected admin routes
  if (pathname.startsWith('/admin')) {
    if (!userCookie) {
      return NextResponse.redirect(loginUrl);
    }

    try {
      const user = JSON.parse(userCookie.value);
      if (user.email !== ADMIN_EMAIL) {
        // Logged in, but not an admin. Redirect to home page.
        return NextResponse.redirect(homeUrl);
      }
    } catch (error) {
      // Invalid cookie, clear it and redirect to login
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(USER_COOKIE);
      return response;
    }
  }

  // If logged in, redirect away from login/signup pages
  if (userCookie && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    try {
        const user = JSON.parse(userCookie.value);
        if (user.email === ADMIN_EMAIL) {
          return NextResponse.redirect(adminUrl);
        }
        return NextResponse.redirect(homeUrl);
    } catch (error) {
        // Invalid cookie, let them proceed to login to fix it, but clear the bad cookie
        const response = NextResponse.next();
        response.cookies.delete(USER_COOKIE);
        return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/signup'],
};
