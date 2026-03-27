import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import DashboardWrapper from './DashboardWrapper';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, calendar_connected')
    .eq('id', user.id)
    .single();

  return (
    <DashboardWrapper
      userEmail={profile?.email}
      userName={profile?.full_name ?? undefined}
      calendarConnected={profile?.calendar_connected ?? false}
    />
  );
}
