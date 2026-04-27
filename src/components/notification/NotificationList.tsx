'use client';

import { Bell } from 'lucide-react';
import Skeleton from '@/components/common/Skeleton';
import NotificationItem from '@/components/notification/NotificationItem';
import type { Notification } from '@/types/notification';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  isError?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NotificationList({
  notifications,
  isLoading = false,
  isError = false,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <ul className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-start gap-3 px-4 py-3">
            <Skeleton variant="circle" width="32px" height="32px" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="30%" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <Bell size={36} className="text-muted" />
        <p className="text-sm text-sub">알림을 불러오는 데 실패했습니다.</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <Bell size={36} className="text-muted" />
        <p className="text-sm text-sub">아직 알림이 없습니다.</p>
      </div>
    );
  }

  return (
    <ul>
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </ul>
  );
}
