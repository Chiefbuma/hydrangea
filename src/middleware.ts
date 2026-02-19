import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a placeholder middleware to prevent build errors.
// It has no effect on the application and simply passes requests through.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// The "matcher" is configured to not match any paths, ensuring this middleware never runs.
export const config = {
  matcher: '/this-path-will-never-be-used/',
};
