import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error`);
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  const supabase = await createSupabaseRouteClient(request, response);

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('exchangeCodeForSession error:', exchangeError);
    return NextResponse.redirect(`${origin}/auth/error`);
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error('No session after code exchange:', sessionError);
    return NextResponse.redirect(`${origin}/auth/error`);
  }

  return response;
}