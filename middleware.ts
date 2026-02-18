import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cloudflare Pages Functions for Next.js
export const config = {
  runtime: 'edge',
};

export function middleware(request: NextRequest) {
  // Handle API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Handle static files
  return NextResponse.next();
}

export default function handler(request: NextRequest) {
  return NextResponse.next();
}
