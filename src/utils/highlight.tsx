/**
 * highlight.tsx
 *
 * 검색 결과 하이라이팅 마크업의 안전 렌더링 유틸.
 *
 * 백엔드가 내려주는 highlights[] 요소는 `<em>` 태그가 포함된 HTML 조각이다.
 * dangerouslySetInnerHTML로 직접 삽입하면 XSS 가능성이 있으므로,
 * `<em>` 태그만 화이트리스트로 허용하는 split 방식으로 React 노드를 생성한다.
 *
 * 처리 규칙:
 *   - `<em>...</em>` 사이의 텍스트는 <mark> 요소로 강조 렌더링.
 *   - 그 외 텍스트는 React 텍스트 노드로 렌더링 → React가 자동 escape하여 XSS를 차단.
 *   - 중첩되거나 닫히지 않은 `<em>`은 매칭 실패 시 평문으로 노출된다.
 */

import type { ReactNode } from 'react';

/** `<em>...</em>` 페어를 비탐욕적으로 매칭하기 위한 정규식. 대소문자 무시. */
const EM_PATTERN = /<em>([\s\S]*?)<\/em>/gi;

/**
 * `<em>` 마크업을 포함할 수 있는 HTML 조각을 React 노드 배열로 변환한다.
 *
 * 기본 element는 <mark>이며, Tailwind 등으로 별도 강조 색상을 입힐 수 있다.
 * 빈 문자열이 입력되면 빈 배열을 반환한다.
 */
export function renderHighlightedFragment(fragment: string): ReactNode[] {
  if (!fragment) return [];

  const nodes: ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  // matchAll은 정규식의 lastIndex를 자동으로 진행시키므로 stateful 상태 걱정 없이 사용한다.
  for (const match of fragment.matchAll(EM_PATTERN)) {
    const [whole, inner] = match;
    const start = match.index ?? 0;

    if (start > cursor) {
      nodes.push(fragment.slice(cursor, start));
    }
    nodes.push(
      <mark
        key={`em-${index}`}
        className="bg-yellow-100 text-foreground font-semibold rounded px-0.5"
      >
        {inner}
      </mark>,
    );
    cursor = start + whole.length;
    index += 1;
  }

  if (cursor < fragment.length) {
    nodes.push(fragment.slice(cursor));
  }

  return nodes;
}
