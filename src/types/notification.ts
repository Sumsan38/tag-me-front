/**
 * notification.ts
 *
 * Notification 도메인 타입 정의.
 *
 * - NotificationType: 알림 유형 (스트릭, 회고, 트렌딩, 챌린지, 소셜)
 * - Notification: 알림 단건 엔티티
 * - UnreadCountResponse: 읽지 않은 알림 수 응답 (알림 배지 표시용)
 */

// ---------------------------------------------------------------------------
// 알림 유형
// ---------------------------------------------------------------------------

/**
 * 알림 유형.
 *   - 'streak_reminder'    : 스트릭 유지 독려 알림 (오늘 아직 기록 없을 때)
 *   - 'retrospect'         : "1년 전 오늘" 회고 카드 알림
 *   - 'trending_tag'       : 트렌딩 태그 알림
 *   - 'challenge_complete' : 챌린지 완료 알림
 *   - 'new_follower'       : 새 팔로워 알림
 *   - 'feed_liked'         : 내 게시글 좋아요 알림
 *   - 'feed_commented'     : 내 게시글 댓글 알림
 */
export type NotificationType =
  | 'streak_reminder'
  | 'retrospect'
  | 'trending_tag'
  | 'challenge_complete'
  | 'new_follower'
  | 'feed_liked'
  | 'feed_commented';

// ---------------------------------------------------------------------------
// 알림 엔티티
// ---------------------------------------------------------------------------

/**
 * 알림 단건.
 * referenceId는 알림과 관련된 리소스의 ID이다.
 *   - 'feed_liked' / 'feed_commented' → feedId
 *   - 'new_follower' → userId
 *   - 'challenge_complete' → challengeId
 *   - 'retrospect' → diaryId
 *   - null이면 특정 리소스와 무관한 알림 (예: 'streak_reminder', 'trending_tag')
 */
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// 읽지 않은 알림 수
// ---------------------------------------------------------------------------

/**
 * 읽지 않은 알림 수 응답.
 * 상단 네비게이션 알림 아이콘의 배지 숫자 표시에 사용한다.
 */
export interface UnreadCountResponse {
  count: number;
}
