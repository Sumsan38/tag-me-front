import {
  TAG_MAX_COUNT,
  TAG_MAX_LENGTH,
  TAG_MIN_LENGTH,
  TAG_SPECIAL_CHAR_PATTERN,
} from '@/constants/tag';

/**
 * 사용자 입력 문자열을 canonical 저장값으로 변환한다.
 *
 * 변환 순서:
 * 1. 선행 '#' 문자 제거 (선택적으로 붙이는 prefix 처리)
 * 2. 허용 문자 외 특수문자 제거 (한글/영문/숫자/공백/밑줄만 유지)
 * 3. 앞뒤 공백 제거
 * 4. 연속 공백을 단일 공백으로 축소
 * 5. 영문 소문자화
 *
 * 빈 문자열이 입력되면 빈 문자열을 반환한다.
 */
export function normalizeTag(input: string): string {
  if (input.length === 0) {
    return '';
  }

  // 1. 선행 '#' 제거 (한 개 이상 연속으로 붙어 있어도 모두 제거)
  const withoutHash = input.replace(/^#+/, '');

  // 2. 허용 문자 외 특수문자 제거
  const allowedOnly = withoutHash.replace(TAG_SPECIAL_CHAR_PATTERN, '');

  // 3. 앞뒤 공백 제거
  const trimmed = allowedOnly.trim();

  // 4. 연속 공백을 단일 공백으로 축소
  const collapsed = trimmed.replace(/ {2,}/g, ' ');

  // 5. 영문 소문자화
  return collapsed.toLowerCase();
}

/**
 * canonical 값을 UI 표시값으로 변환한다.
 *
 * '#' prefix를 붙여 반환한다.
 * canonical이 빈 문자열이면 빈 문자열을 반환한다.
 */
export function displayTag(canonical: string): string {
  if (canonical.length === 0) {
    return '';
  }
  return `#${canonical}`;
}

/**
 * 태그 입력값의 유효성을 검증한다.
 *
 * normalizeTag 적용 후 길이가 TAG_MIN_LENGTH ~ TAG_MAX_LENGTH 범위에
 * 속하는지 확인한다.
 */
export function validateTag(input: string): { valid: boolean; error?: string } {
  const canonical = normalizeTag(input);

  if (canonical.length < TAG_MIN_LENGTH) {
    return { valid: false, error: '태그는 1자 이상 입력해야 합니다.' };
  }

  if (canonical.length > TAG_MAX_LENGTH) {
    return {
      valid: false,
      error: `태그는 최대 ${TAG_MAX_LENGTH}자까지 입력할 수 있습니다.`,
    };
  }

  return { valid: true };
}

/**
 * 태그 목록에서 canonical 기준으로 중복을 제거한다.
 *
 * - 각 항목에 normalizeTag를 적용한 뒤 중복 여부를 판단한다.
 * - 빈 문자열로 정규화되는 항목은 제거된다.
 * - 입력 배열의 순서를 유지하며, 먼저 등장한 항목이 살아남는다.
 */
export function deduplicateTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const canonical = normalizeTag(tag);
    if (canonical.length === 0) {
      continue;
    }
    if (!seen.has(canonical)) {
      seen.add(canonical);
      result.push(canonical);
    }
  }

  return result;
}

/**
 * 현재 태그 목록에 새 태그를 추가할 수 있는지 검사한다.
 *
 * 다음 세 가지를 순서대로 확인한다:
 * 1. 최대 개수(TAG_MAX_COUNT) 초과 여부
 * 2. 유효성 (normalizeTag 후 길이 범위)
 * 3. 중복 여부 (canonical 기준)
 */
export function canAddTag(
  currentTags: string[],
  newTag: string,
): { allowed: boolean; reason?: string } {
  if (currentTags.length >= TAG_MAX_COUNT) {
    return {
      allowed: false,
      reason: `태그는 최대 ${TAG_MAX_COUNT}개까지 추가할 수 있습니다.`,
    };
  }

  const validation = validateTag(newTag);
  if (!validation.valid) {
    return { allowed: false, reason: validation.error };
  }

  const canonical = normalizeTag(newTag);
  const alreadyExists = currentTags.some(
    (existing) => normalizeTag(existing) === canonical,
  );

  if (alreadyExists) {
    return { allowed: false, reason: '이미 추가된 태그입니다.' };
  }

  return { allowed: true };
}
