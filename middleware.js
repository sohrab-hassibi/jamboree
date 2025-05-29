import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Get the session
  const { data: { session } } = await supabase.auth.getSession();

  // Public paths that don't require auth
  const publicPaths = ['/', '/login', '/signup'];
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname);
  const isProfilePath = req.nextUrl.pathname.startsWith('/profile/');
  
  // Allow access to profile paths even without session
  if (isProfilePath) {
    return res;
  }
  
  // If no session and trying to access protected route, redirect to login
  if (!session && !isPublicPath) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // If logged in, check onboarding status for protected routes
  if (session && !isPublicPath && req.nextUrl.pathname !== '/onboarding') {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('instruments, genres, bio, avatar_url')
      .eq('id', session.user.id)
      .single();

    // Only consider onboarding incomplete if NO fields are filled
    const hasStartedOnboarding = profile && (
      profile.instruments?.length > 0 ||
      profile.genres?.length > 0 ||
      profile.bio ||
      profile.avatar_url
    );

    // If onboarding hasn't even been started, redirect to onboarding
    if (!profile || !hasStartedOnboarding) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/onboarding';
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding',
    '/profile/:path*',
    '/',
    '/login',
    '/signup'
  ],
};
