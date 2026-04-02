/** 태그 1개의 최대 글자 수 (정규화 후 기준) */
export const TAG_MAX_LENGTH = 30;

/** 태그 1개의 최소 글자 수 (정규화 후 기준) */
export const TAG_MIN_LENGTH = 1;

/** 일기/게시글 당 첨부 가능한 최대 태그 수 */
export const TAG_MAX_COUNT = 10;

/**
 * 태그에 허용되는 문자 집합 정규식.
 * 한글(가-힣), 영문(a-zA-Z), 숫자(0-9), 공백( ), 밑줄(_)만 허용한다.
 * 이 패턴에 일치하지 않는 문자는 저장 전 정규화 단계에서 제거된다.
 */
export const TAG_ALLOWED_PATTERN = /[^\uAC00-\uD7A3a-zA-Z0-9 _]/g;

/**
 * 태그 입력 값에서 제거해야 할 특수문자 패턴.
 * '#' prefix 제거 후 적용되며, TAG_ALLOWED_PATTERN과 동일 범위를 사용한다.
 * 별도 상수로 분리하여 의도를 명확히 한다.
 */
export const TAG_SPECIAL_CHAR_PATTERN = /[^\uAC00-\uD7A3a-zA-Z0-9 _]/g;

/**
 * 태그 팔레트 클래스 (globals.css --color-tag-palette-* 토큰 기반).
 * idx % 6 순환으로 사용한다.
 */
export const TAG_PALETTE_CLASSES = [
  { fg: 'text-tag-palette-0-fg', bg: 'bg-tag-palette-0-bg' },
  { fg: 'text-tag-palette-1-fg', bg: 'bg-tag-palette-1-bg' },
  { fg: 'text-tag-palette-2-fg', bg: 'bg-tag-palette-2-bg' },
  { fg: 'text-tag-palette-3-fg', bg: 'bg-tag-palette-3-bg' },
  { fg: 'text-tag-palette-4-fg', bg: 'bg-tag-palette-4-bg' },
  { fg: 'text-tag-palette-5-fg', bg: 'bg-tag-palette-5-bg' },
] as const;

/** 태그 제안 기본값 (추후 API 연동 시 대체 예정) */
export const TAG_SUGGESTIONS = ['일상', '감정', '성장', '여행'] as const;
