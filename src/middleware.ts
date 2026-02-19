import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Only run this middleware in production
  if (process.env.NODE_ENV === 'production') {
    // Get the protocol from the x-forwarded-proto header, which is standard for proxies like Phusion Passenger
    const protocol = req.headers.get('x-forwarded-proto');

    // If the request is not over HTTPS, construct the HTTPS URL and redirect
    if (protocol && protocol.indexOf('https') < 0) {
      const newUrl = new URL(req.url);
      newUrl.protocol = 'https:';
      // Use a 301 redirect to tell browsers and search engines this is permanent
      return NextResponse.redirect(newUrl.toString(), 301);
    }
  }

  // Continue with the request if it's already HTTPS or not in production
  return NextResponse.next();
}

// The matcher ensures the middleware only runs on page requests, not on API routes or static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
