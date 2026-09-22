import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Optimistic gate for the admin area: no session cookie → straight to login,
 * without rendering anything. This is a UX shortcut, NOT the security boundary —
 * the cookie is not verified here. The real check is `requireAdmin()` in
 * src/app/(admin)/admin/layout.tsx and in every admin Server Action.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const login = new URL('/ingresar', request.url);
    login.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
