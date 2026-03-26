import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state');
  const error = searchParams.get('error');

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

  if (error || !code || !userId) {
    return NextResponse.redirect(`${dashboardUrl}?calendar=error`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/calendar/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.json();
      console.error('Token exchange failed:', err);
      return NextResponse.redirect(`${dashboardUrl}?calendar=error`);
    }

    const tokens = await tokenRes.json();
    const supabase = createSupabaseServiceClient();

    const { error: updateError } = await supabase
      .from('users')
      .update({
        google_calendar_token: tokens.access_token,
        google_calendar_refresh_token: tokens.refresh_token,
        google_calendar_token_expiry: Math.floor(Date.now() / 1000) + (tokens.expires_in || 3600),
        calendar_connected: true,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('DB update failed:', updateError);
      return NextResponse.redirect(`${dashboardUrl}?calendar=error`);
    }

    return NextResponse.redirect(`${dashboardUrl}?calendar=connected`);
  } catch (err) {
    console.error('Calendar callback error:', err);
    return NextResponse.redirect(`${dashboardUrl}?calendar=error`);
  }
}