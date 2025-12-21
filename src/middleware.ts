import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes require admin or employee role
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'admin' && token?.role !== 'employee') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Customer routes require any authenticated user
    if (pathname.startsWith('/account') || pathname.startsWith('/orders') || pathname.startsWith('/profile')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes are always authorized
        if (
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/login') ||
          pathname.startsWith('/register') ||
          pathname.startsWith('/shop') ||
          pathname.startsWith('/classes') ||
          pathname.startsWith('/cart') ||
          pathname.startsWith('/checkout') ||
          pathname.startsWith('/about') ||
          pathname.startsWith('/contact') ||
          pathname === '/'
        ) {
          return true;
        }

        // Admin routes require admin or employee role
        if (pathname.startsWith('/admin')) {
          return token?.role === 'admin' || token?.role === 'employee';
        }

        // Customer routes require authentication
        if (pathname.startsWith('/account') || pathname.startsWith('/orders') || pathname.startsWith('/profile')) {
          return !!token;
        }

        // Default: allow
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
