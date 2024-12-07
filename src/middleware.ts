import { NextResponse } from 'next/server';

export function middleware(req: any) {
  const token = req.cookies.get('token');
  if (!token && req.nextUrl.pathname !== '/login' && req.nextUrl.pathname !== '/register') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'], // רק מסלולים שדורשים אימות
};
