import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is a dashboard route (starts with / or is in the dashboard group)
  const isDashboardRoute = 
    pathname === '/' || 
    pathname.startsWith('/prompts') || 
    pathname.startsWith('/a-b-testing') || 
    pathname.startsWith('/integration');
  
  // Check if the path is an auth route
  const isAuthRoute = pathname.startsWith('/auth');
  
  // Get the token
  const token = await getToken({ req: request });
  
  // If it's a dashboard route and the user is not authenticated, redirect to login
  if (isDashboardRoute && !token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  
  // If it's an auth route and the user is authenticated, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}; 