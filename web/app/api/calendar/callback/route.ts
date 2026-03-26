import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { exchangeCodeForTokens, CalendarAuthError } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code || !userId) {
    return NextResponse.redirect(
      new URL('/dashboard?calendar=error', request.url)
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const supabase = createSupabaseServiceClient();

    const expiryTime = Math.floor(Date.now() / 1000) + (tokens.expires_in || 3600);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        google_calendar_token: tokens.access_token,
        google_calendar_refresh_token: tokens.refresh_token,
        google_calendar_token_expiry: expiryTime,
        calendar_connected: true,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to store calendar token:', updateError);
      return NextResponse.redirect(
        new URL('/dashboard?calendar=error', request.url)
      );
    }

    return NextResponse.redirect(
      new URL('/dashboard?calendar=connected', request.url)
    );
  } catch (err) {
    console.error('Calendar callback error:', err);
    return NextResponse.redirect(
      new URL('/dashboard?calendar=error', request.url)
    );
  }
}