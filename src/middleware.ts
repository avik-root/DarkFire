
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { USER_COOKIE } from '@/lib/auth-shared';

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get(USER_COOKIE);
  const { pathname } = request.nextUrl;

  const loginUrl = new URL('/login', request.url);
  const adminUrl = new URL('/admin', request.url);
  const playgroundUrl = new URL('/playground', request.url);

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isAdminPage = pathname.startsWith('/admin');
  const isPlaygroundPage = pathname.startsWith('/playground');

  if (!userCookie) {
    if (isAdminPage || isPlaygroundPage) {
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    const user = JSON.parse(userCookie.value);
    const isAdmin = user.role === 'admin';

    if (isAdminPage && !isAdmin) {
      return NextResponse.redirect(playgroundUrl);
    }

    if (isPlaygroundPage && isAdmin) {
      return NextResponse.redirect(adminUrl);
    }
    
    if (isAuthPage) {
        return NextResponse.redirect(isAdmin ? adminUrl : playgroundUrl);
    }

  } catch (error) {
    // Invalid cookie, clear it and redirect to login if on a protected page
    const response = (isAdminPage || isPlaygroundPage) ? NextResponse.redirect(loginUrl) : NextResponse.next();
    response.cookies.delete(USER_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/signup', '/playground'],
};
