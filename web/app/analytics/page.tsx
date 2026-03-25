import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/Navbar';
import AnalyticsClient from './AnalyticsClient';

export default async function AnalyticsPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <Navbar userEmail={profile?.email} userName={profile?.full_name ?? undefined} />
      <AnalyticsClient />
    </div>
  );
}
