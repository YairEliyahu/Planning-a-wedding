import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // הוספת headers לביצועים
  const isAPIRoute = request.nextUrl.pathname.startsWith('/api');
  const isStaticAsset = request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|css|js|woff|woff2|ttf|eot|ico)$/);
  
  if (isAPIRoute) {
    // Cache headers ל-API routes
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=60');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }
  
  if (isStaticAsset) {
    // Cache ארוך לקבצים סטטיים
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Compression headers
  const acceptsGzip = request.headers.get('accept-encoding')?.includes('gzip');
  if (acceptsGzip) {
    response.headers.set('Vary', 'Accept-Encoding');
  }
  
  // ביצועי אבטחה
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
