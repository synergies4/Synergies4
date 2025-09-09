import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';

  // Force www to avoid SSL/redirect inconsistencies and preserve query
  if (host === 'synergies4ai.com') {
    url.hostname = 'www.synergies4ai.com';
    return NextResponse.redirect(url);
  }
  const hasCode = url.searchParams.has('code');
  const hasAuthError = url.searchParams.has('error') || url.searchParams.has('error_code');
  const hasRecovery = url.searchParams.get('type') === 'recovery' || url.searchParams.has('token_hash');

  // If Supabase sends a recovery link to any page (often '/'),
  // redirect to our reset-password flow while preserving query.
  if ((hasCode || hasAuthError || hasRecovery) && url.pathname !== '/reset-password') {
    url.pathname = '/reset-password';
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


