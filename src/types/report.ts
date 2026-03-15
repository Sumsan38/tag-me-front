/**
 * report.ts
 *
 * Report 도메인 타입 정의 (월간 리포트 카드 + SNS 공유).
 *
 * - MonthlyReport: 월간 리포트 전체 데이터 (TOP 태그, 활동 통계, 스트릭, 분위기)
 * - ReportTag: 리포트 내 태그 집계 단건
 * - ReportShareInfo: SNS 공유용 URL 및 Open Graph 이미지 정보
 *
 * shareUrl이 null이면 공유 URL이 아직 생성되지 않은 상태이다.
 * SNS 공유 시 서버에서 Open Graph 메타태그가 포함된 URL을 발급한다.
 */

import type { SharePeriod } from './common';

// ---------------------------------------------------------------------------
// 월간 리포트
// ---------------------------------------------------------------------------

/**
 * 월간 리포트 전체 데이터.
 * month는 'yyyy-MM' 형식이다 (예: '2026-03').
 * topMood.ratio는 0~1 범위의 비율이다.
 * shareUrl이 null이면 reportApi.getShareUrl(period)로 발급 후 사용한다.
 */
export interface MonthlyReport {
  id: string;
  month: SharePeriod; // yyyy-MM
  topTags: ReportTag[];
  totalDiaries: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  topMood: {
    emoji: string;
    label: string;
    ratio: number; // 0~1
  };
  longestStreak: number;
  shareUrl: string | null; // null이면 미생성 상태
}

// ---------------------------------------------------------------------------
// 리포트 태그 집계
// ---------------------------------------------------------------------------

/**
 * 리포트 내 태그 집계 단건.
 * rank는 1부터 시작하는 순위이며 topTags 배열 정렬 순서와 일치한다.
 */
export interface ReportTag {
  name: string;
  count: number;
  rank: number;
}

// ---------------------------------------------------------------------------
// 공유 식별자
// ---------------------------------------------------------------------------

/**
 * SNS 공유용 리포트 URL 정보.
 * shareUrl은 Open Graph 메타태그가 포함된 공유 전용 URL이다.
 * ogImageUrl은 카카오/트위터 공유 시 썸네일로 사용되는 이미지 URL이다.
 * reportId는 공유 링크를 열었을 때 서버에서 리포트를 조회하는 식별자이다.
 */
export interface ReportShareInfo {
  reportId: string;
  shareUrl: string;
  ogImageUrl: string;
}
