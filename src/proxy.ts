import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths: Landing page (/), Login (/login), API routes, and static assets
  const isPublicPath = 
    path === '/' || 
    path === '/login' || 
    path.startsWith('/_next') || 
    path.startsWith('/api') || 
    path.includes('.'); // Static files like .png, .ico, .jpg
  
  const token = request.cookies.get('rover_auth')?.value || '';

  // Protect /dashboard and any private routes
  if (!isPublicPath && !token) {
    const loginUrl = new URL('/login', request.nextUrl);
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
