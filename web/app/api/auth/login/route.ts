import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next();
  const supabase = await createSupabaseRouteClient(request, response);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      scopes: 'openid email profile https://www.googleapis.com/auth/calendar.events',
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.redirect(data.url);
}
