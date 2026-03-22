'use client';

import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Bell size={48} className="text-muted" />
      <h1 className="text-lg font-bold text-text">알림</h1>
      <p className="text-sm text-sub">알림 기능은 곧 구현됩니다.</p>
    </div>
  );
}
