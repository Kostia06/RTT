import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;
  const isProtected = ['/account', '/orders'].some(p => pathname.startsWith(p));
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if ((pathname === '/login' || pathname === '/register') && sessionCookie) {
    return NextResponse.redirect(new URL('/account', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/account/:path*', '/orders/:path*', '/login', '/register'] };
