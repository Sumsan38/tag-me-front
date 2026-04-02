import { z } from 'zod';

/** 기분 이모지 (1~5 매핑, idx+1 = mood 값) */
export const MOOD_EMOJIS = ['😤', '😔', '😐', '😌', '😊'] as const;

/** 기분 라벨 (1~5 매핑) */
export const MOOD_LABELS = ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'] as const;

/** 기분 기본 인덱스 (보통) — 폴백용 */
export const MOOD_DEFAULT_INDEX = 2;

// ---------------------------------------------------------------------------
// 공통 Zod 스키마 (작성 & 수정 폼에서 공유)
// ---------------------------------------------------------------------------

export const diarySchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(255),
  content: z.string().min(1, '내용을 입력해주세요.').max(10000),
  mood: z.number().min(1, '기분을 선택해주세요.').max(5),
});

export type DiaryFormValues = z.infer<typeof diarySchema>;

// ---------------------------------------------------------------------------
// 년도 선택 범위
// ---------------------------------------------------------------------------

/** 년도 선택 최소값 */
export const YEAR_MIN = 2000;

/** 년도 선택 최대값 */
export const YEAR_MAX = 2100;

/** 월 라벨 (1~12) */
export const MONTH_LABELS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
] as const;
