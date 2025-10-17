import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';

  // WWW redirect removed - was causing SSL errors
  // Configure SSL for both domains in Vercel/hosting instead
  
  const hasCode = url.searchParams.has('code');
  const hasAuthError = url.searchParams.has('error') || url.searchParams.has('error_code');
  const hasRecovery = url.searchParams.get('type') === 'recovery' || url.searchParams.has('token_hash');

  // ONLY redirect to reset-password if it's explicitly a recovery/reset link
  // DO NOT redirect email verification callbacks (which also have 'code' param)
  if (hasRecovery && url.pathname !== '/reset-password') {
    url.pathname = '/reset-password';
    return NextResponse.redirect(url);
  }
  
  // If there's an auth error, redirect to login with error message
  if (hasAuthError && url.pathname !== '/login') {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all routes except static files and API
    '/((?!_next/static|_next/image|favicon.ico|sw.js|workbox-.*|api).*)',
  ],
};


