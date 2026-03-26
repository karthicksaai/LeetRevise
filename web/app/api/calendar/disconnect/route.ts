import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, createSupabaseServiceClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseServiceClient();
  await supabase
    .from('users')
    .update({
      google_calendar_token: null,
      google_calendar_refresh_token: null,
      google_calendar_token_expiry: null,
      calendar_connected: false,
    })
    .eq('id', user.id);

  return NextResponse.json({ success: true });
}