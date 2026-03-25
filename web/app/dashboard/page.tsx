import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/Navbar';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar userEmail={profile?.email} userName={profile?.full_name ?? undefined} />
      <DashboardClient />
    </div>
  );
}
