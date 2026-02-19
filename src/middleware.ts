import { NextResponse, type NextRequest } from 'next/server';

// This is a placeholder middleware that does nothing.
// It is required to prevent a build error when a middleware.ts file exists but is empty.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// The matcher is set to a path that will never be matched.
export const config = {
  matcher: '/__this-path-will-never-be-used__/',
};
