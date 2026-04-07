
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware is temporarily disabled to allow for a pure mock-data demonstration.
 * This ensures the mock login redirect in the client-side code isn't blocked 
 * by a missing database session cookie.
 */
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
