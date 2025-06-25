
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { USER_COOKIE } from '@/lib/auth-shared';

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get(USER_COOKIE);
  const { pathname } = request.nextUrl;

  const loginUrl = new URL('/login', request.url);
  const adminUrl = new URL('/admin', request.url);
  const playgroundUrl = new URL('/playground', request.url);
  const requestAccessUrl = new URL('/request-access', request.url);


  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isAdminPage = pathname.startsWith('/admin');
  const isPlaygroundPage = pathname.startsWith('/playground');
  const isRequestAccessPage = pathname.startsWith('/request-access');

  if (!userCookie) {
    if (isAdminPage || isPlaygroundPage || isRequestAccessPage) {
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
        if (isAdmin) {
            return NextResponse.redirect(adminUrl);
        }
        if (!user.formSubmitted) {
            return NextResponse.redirect(requestAccessUrl);
        }
        return NextResponse.redirect(playgroundUrl);
    }
    
    // Redirect a user from request-access if they already submitted
    if (isRequestAccessPage && user.formSubmitted && !isAdmin) {
        return NextResponse.redirect(playgroundUrl);
    }

    // Redirect a user from playground if they haven't submitted the form
    if (isPlaygroundPage && !user.formSubmitted && !isAdmin) {
        return NextResponse.redirect(requestAccessUrl);
    }


  } catch (error) {
    // Invalid cookie, clear it and redirect to login if on a protected page
    const response = (isAdminPage || isPlaygroundPage || isRequestAccessPage) ? NextResponse.redirect(loginUrl) : NextResponse.next();
    response.cookies.delete(USER_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/signup', '/playground', '/request-access'],
};
