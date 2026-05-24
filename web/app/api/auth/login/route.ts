import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const next = request.nextUrl.searchParams.get('next') ?? '/dashboard';

  if (!appUrl) {
    console.error('NEXT_PUBLIC_APP_URL is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  try {
    const tempResponse = NextResponse.next();
    const supabase = await createSupabaseRouteClient(request, tempResponse);

    const callbackUrl = new URL('/api/auth/callback', appUrl);
    callbackUrl.searchParams.set('next', next);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
        scopes: 'openid email profile',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error || !data.url) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
    }

    const redirectResponse = NextResponse.redirect(data.url);
    tempResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  } catch (err) {
    console.error('Login route error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}