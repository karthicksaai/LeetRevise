import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = createSupabaseServiceClient();
    // Lightweight ping — just count users
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      userCount: count
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 });
  }
}