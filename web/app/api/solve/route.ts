import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest, createSupabaseServiceClient } from '@/lib/supabase-server';

const solveSchema = z.object({
  problem_id: z.string().uuid(),
});

function createCorsHeaders(origin?: string) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin');
  const corsHeaders = createCorsHeaders(origin);

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const parsed = solveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten().fieldErrors }, { status: 400, headers: corsHeaders });
    }

    const { problem_id } = parsed.data;
    const supabase = createSupabaseServiceClient();

    const { data: problem, error: fetchError } = await supabase
      .from('scheduled_problems')
      .select('id, user_id')
      .eq('id', problem_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !problem) {
      return NextResponse.json({ success: false, error: 'Problem not found' }, { status: 404, headers: corsHeaders });
    }

    const { error: updateProblemError } = await supabase
      .from('scheduled_problems')
      .update({ is_solved: true, solved_at: new Date().toISOString() })
      .eq('id', problem_id);

    if (updateProblemError) {
      return NextResponse.json({ success: false, error: 'Failed to mark problem as solved' }, { status: 500, headers: corsHeaders });
    }

    const today = new Date().toISOString().split('T')[0];
    const { error: updateEventsError } = await supabase
      .from('revision_events')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('problem_id', problem_id)
      .gte('due_date', today)
      .eq('is_completed', false);

    if (updateEventsError) {
      return NextResponse.json({ success: false, error: 'Failed to mark revision events as completed' }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: createCorsHeaders('*'),
  });
}
