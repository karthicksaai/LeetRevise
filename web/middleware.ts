import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle OPTIONS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // For all other API requests, add CORS headers to response
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
