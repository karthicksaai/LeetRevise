'use client';

import Navbar from '@/components/Navbar';
import CalendarBanner from '@/components/CalendarBanner';
import DashboardClient from './DashboardClient';

interface DashboardWrapperProps {
  userEmail?: string;
  userName?: string;
  calendarConnected: boolean;
}

export default function DashboardWrapper({
  userEmail,
  userName,
  calendarConnected,
}: DashboardWrapperProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar userEmail={userEmail} userName={userName} />
      <CalendarBanner connected={calendarConnected} />
      <DashboardClient />
    </div>
  );
}
