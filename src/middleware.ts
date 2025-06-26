import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { USER_COOKIE } from '@/lib/auth-shared';

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get(USER_COOKIE);
  const url = request.nextUrl.clone();

  // Add the pathname to the request headers
  request.headers.set('x-next-url', request.nextUrl.pathname);

  const loginUrl = new URL('/login', request.url);
  const adminUrl = new URL('/admin', request.url);
  const playgroundUrl = new URL('/playground', request.url);
  const requestAccessUrl = new URL('/request-access', request.url);

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isAdminPage = pathname.startsWith('/admin');
  const isPlaygroundPage = pathname.startsWith('/playground') || pathname.startsWith('/purchase');
  const isRequestAccessPage = pathname.startsWith('/request-access');

  if (!userCookie) {
    if (isAdminPage || isPlaygroundPage || isRequestAccessPage) {
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next({ request });
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
      const destination = isAdmin ? adminUrl : (user.formSubmitted ? playgroundUrl : requestAccessUrl);
      return NextResponse.redirect(destination);
    }
    
    if (isRequestAccessPage && user.formSubmitted && !isAdmin) {
      return NextResponse.redirect(playgroundUrl);
    }

    if (isPlaygroundPage && !user.formSubmitted && !isAdmin) {
      return NextResponse.redirect(requestAccessUrl);
    }

  } catch (error) {
    const response = (isAdminPage || isPlaygroundPage || isRequestAccessPage) ? NextResponse.redirect(loginUrl) : NextResponse.next({ request });
    response.cookies.delete(USER_COOKIE);
    return response;
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/signup', '/playground', '/request-access', '/purchase'],
};
