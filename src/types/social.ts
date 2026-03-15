/**
 * social.ts
 *
 * Social 도메인 타입 정의.
 *
 * - Circle: 태그 기반 그룹
 * - Challenge: 태그 챌린지 (기간, 참여 여부, 진행률)
 * - Follow: 팔로우 관계
 * - TagFriend: 1:1 태그 친구 매칭 결과
 * - TagFriendMessage: 태그 친구 간 메시지
 * - UserRecommendation: 유사 사용자 추천 (공통 태그 기반)
 */

// ---------------------------------------------------------------------------
// 써클 (태그 기반 그룹)
// ---------------------------------------------------------------------------

/**
 * 태그 기반 그룹(써클).
 * 특정 태그 집합을 중심으로 구성된 커뮤니티 단위이다.
 */
export interface Circle {
  id: string;
  name: string;
  tags: string[];
  memberCount: number;
  createdAt: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// 챌린지
// ---------------------------------------------------------------------------

/**
 * 태그 챌린지.
 * isJoined는 현재 인증된 사용자의 참여 여부이다.
 * progress는 0~100 범위의 진행률이며, 참여 중인 경우에만 포함된다.
 * startDate / endDate는 'yyyy-MM-dd' 형식이다.
 */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  tags: string[];
  startDate: string;        // yyyy-MM-dd
  endDate: string;          // yyyy-MM-dd
  participantCount: number;
  isJoined: boolean;
  progress?: number;        // 0~100, 참여 중인 경우에만 포함
}

// ---------------------------------------------------------------------------
// 팔로우
// ---------------------------------------------------------------------------

/**
 * 팔로우 관계.
 * isFollowing은 현재 인증된 사용자가 해당 유저를 팔로우 중인지 여부이다.
 */
export interface Follow {
  userId: string;
  nickname: string;
  profileImage: string | null;
  isFollowing: boolean;
}

// ---------------------------------------------------------------------------
// 태그 친구
// ---------------------------------------------------------------------------

/**
 * 1:1 태그 친구 매칭 결과.
 * commonTags는 두 사용자 간에 공통으로 보유한 태그 목록이다.
 * matchedAt은 매칭이 이루어진 시각이다 (ISO 8601).
 */
export interface TagFriend {
  id: string;
  userId: string;
  nickname: string;
  profileImage: string | null;
  commonTags: string[];
  matchedAt: string; // ISO 8601
}

/**
 * 태그 친구 간 메시지.
 */
export interface TagFriendMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// 유사 사용자 추천
// ---------------------------------------------------------------------------

/**
 * 유사 사용자 추천.
 * commonTags는 현재 사용자와 공통으로 보유한 태그 목록이다.
 * commonTagCount는 팔로우 버튼 옆 "태그 N개 일치" 배지에 사용한다.
 */
export interface UserRecommendation {
  userId: string;
  nickname: string;
  profileImage: string | null;
  commonTags: string[];
  commonTagCount: number;
}
