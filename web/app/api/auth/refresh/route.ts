import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withCors } from '@/lib/cors';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = refreshSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'refresh_token required' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: parsed.data.refresh_token,
    });

    if (error || !data.session) {
      return NextResponse.json({ success: false, error: 'Failed to refresh token' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export const POST = withCors(handler);
export const OPTIONS = withCors(async () => NextResponse.json(null));
