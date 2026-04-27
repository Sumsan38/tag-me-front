'use client';

import NotificationList from '@/components/notification/NotificationList';

/**
 * 알림 페이지.
 *
 * 현재는 NotificationList 컴포넌트를 통해 알림 목록 UI만 렌더링한다.
 * 실제 API 연동은 useNotification 훅 구현 후 notifications prop에 주입한다.
 */
export default function NotificationsPage() {
  return (
    <div className="max-w-lg mx-auto py-6">
      <h1 className="text-lg font-bold text-text px-4 mb-4">알림</h1>
      <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
        <NotificationList notifications={[]} />
      </div>
    </div>
  );
}
