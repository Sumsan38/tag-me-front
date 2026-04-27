'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Bell,
  Heart,
  MessageCircle,
  MessageSquareReply,
  ThumbsUp,
  UserPlus,
  Flame,
  RotateCcw,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import type { Notification, NotificationType } from '@/types/notification';

// ---------------------------------------------------------------------------
// 알림 타입별 메타 정보
// ---------------------------------------------------------------------------

interface NotificationMeta {
  icon: React.ReactNode;
  /** message 필드가 없을 때 fallback으로 사용하는 기본 문구 */
  defaultMessage: string;
}

function getNotificationMeta(type: NotificationType): NotificationMeta {
  switch (type) {
    case 'feed_liked':
      return {
        icon: <Heart size={16} className="text-error" />,
        defaultMessage: '누군가 내 게시글을 좋아합니다.',
      };
    case 'feed_commented':
      return {
        icon: <MessageCircle size={16} className="text-primary" />,
        defaultMessage: '누군가 내 게시글에 댓글을 달았습니다.',
      };
    case 'reply':
      return {
        icon: <MessageSquareReply size={16} className="text-primary" />,
        defaultMessage: '누군가 내 댓글에 답글을 달았습니다.',
      };
    case 'comment_like':
      return {
        icon: <ThumbsUp size={16} className="text-error" />,
        defaultMessage: '누군가 내 댓글을 좋아합니다.',
      };
    case 'new_follower':
      return {
        icon: <UserPlus size={16} className="text-success" />,
        defaultMessage: '새 팔로워가 생겼습니다.',
      };
    case 'streak_reminder':
      return {
        icon: <Flame size={16} className="text-warning" />,
        defaultMessage: '오늘 아직 기록이 없습니다. 스트릭을 이어가세요!',
      };
    case 'retrospect':
      return {
        icon: <RotateCcw size={16} className="text-sub" />,
        defaultMessage: '1년 전 오늘의 기록이 있습니다.',
      };
    case 'trending_tag':
      return {
        icon: <TrendingUp size={16} className="text-primary" />,
        defaultMessage: '지금 트렌딩 태그를 확인해보세요.',
      };
    case 'challenge_complete':
      return {
        icon: <Trophy size={16} className="text-warning" />,
        defaultMessage: '챌린지를 완료했습니다.',
      };
    default:
      return {
        icon: <Bell size={16} className="text-sub" />,
        defaultMessage: '새로운 알림이 있습니다.',
      };
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface NotificationItemProps {
  notification: Notification;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NotificationItem({ notification }: NotificationItemProps) {
  const { icon, defaultMessage } = getNotificationMeta(notification.type);

  const relativeTime = formatDistanceToNow(parseISO(notification.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const displayMessage = notification.message || defaultMessage;

  return (
    <li
      className={[
        'flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0',
        notification.isRead ? 'bg-surface' : 'bg-primary/5',
      ].join(' ')}
    >
      {/* 타입 아이콘 */}
      <span className="mt-0.5 flex-shrink-0">{icon}</span>

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text leading-snug">{displayMessage}</p>
        <time
          dateTime={notification.createdAt}
          className="text-xs text-sub mt-1 block"
        >
          {relativeTime}
        </time>
      </div>

      {/* 읽지 않음 표시 */}
      {!notification.isRead && (
        <span
          aria-label="읽지 않은 알림"
          className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-primary"
        />
      )}
    </li>
  );
}
