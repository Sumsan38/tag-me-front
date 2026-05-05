/**
 * highlight.test.tsx
 *
 * renderHighlightedFragment의 안전성·정확성 회귀 테스트.
 *
 * 핵심 보장:
 *   - `<em>` 마크업만 <mark>로 변환되고 그 외 태그는 평문으로 escape된다 (XSS 차단).
 *   - 비탐욕적 매칭으로 다중 `<em>` 페어를 올바르게 분리한다.
 *   - `<em>` 페어 사이의 일반 텍스트는 그대로 보존된다.
 *   - 빈 문자열·매칭 없는 입력은 단순 텍스트로 반환된다.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { renderHighlightedFragment } from '@/utils/highlight';

function renderFragment(input: string) {
  return render(<div data-testid="root">{renderHighlightedFragment(input)}</div>);
}

describe('renderHighlightedFragment', () => {
  it('빈 문자열 입력은 빈 노드 배열을 반환한다', () => {
    renderFragment('');
    const root = screen.getByTestId('root');
    expect(root.textContent).toBe('');
    expect(root.querySelectorAll('mark').length).toBe(0);
  });

  it('`<em>` 페어를 <mark>로 변환한다', () => {
    renderFragment('hello <em>world</em>');
    const root = screen.getByTestId('root');
    const mark = within(root).getByText('world');
    expect(mark.tagName.toLowerCase()).toBe('mark');
    expect(root.textContent).toBe('hello world');
  });

  it('다중 `<em>` 페어를 모두 <mark>로 변환한다', () => {
    renderFragment('a <em>b</em> c <em>d</em> e');
    const root = screen.getByTestId('root');
    const marks = root.querySelectorAll('mark');
    expect(marks.length).toBe(2);
    expect(marks[0].textContent).toBe('b');
    expect(marks[1].textContent).toBe('d');
    expect(root.textContent).toBe('a b c d e');
  });

  it('비탐욕적으로 매칭한다 (인접한 `<em>` 페어가 합쳐지지 않는다)', () => {
    renderFragment('<em>x</em> and <em>y</em>');
    const root = screen.getByTestId('root');
    const marks = root.querySelectorAll('mark');
    expect(marks.length).toBe(2);
    expect(marks[0].textContent).toBe('x');
    expect(marks[1].textContent).toBe('y');
  });

  it('`<em>` 외 태그는 평문으로 escape되어 노출된다 (XSS 차단)', () => {
    renderFragment('<script>alert(1)</script>');
    const root = screen.getByTestId('root');
    // React가 텍스트 노드로 렌더하므로 실제 <script>는 DOM에 생성되지 않는다.
    expect(root.querySelector('script')).toBeNull();
    // 입력 문자열이 평문 그대로 노출된다.
    expect(root.textContent).toBe('<script>alert(1)</script>');
  });

  it('`<em>` 안에 다른 태그가 들어 있어도 텍스트로만 렌더된다', () => {
    renderFragment('<em><img src=x onerror=alert(1)></em>');
    const root = screen.getByTestId('root');
    // <mark>는 생성되지만 그 자식은 텍스트 노드뿐이며 <img>가 만들어지지 않는다.
    const mark = root.querySelector('mark');
    expect(mark).not.toBeNull();
    expect(mark!.querySelector('img')).toBeNull();
    expect(mark!.textContent).toBe('<img src=x onerror=alert(1)>');
  });

  it('닫히지 않은 `<em>`은 매칭 실패로 평문 노출된다', () => {
    renderFragment('hello <em>world');
    const root = screen.getByTestId('root');
    expect(root.querySelector('mark')).toBeNull();
    expect(root.textContent).toBe('hello <em>world');
  });

  it('대문자 `<EM>`도 매칭한다 (대소문자 무시)', () => {
    renderFragment('<EM>match</EM>');
    const root = screen.getByTestId('root');
    const mark = root.querySelector('mark');
    expect(mark).not.toBeNull();
    expect(mark!.textContent).toBe('match');
  });

  it('매칭이 없는 일반 텍스트는 그대로 반환된다', () => {
    renderFragment('plain text');
    const root = screen.getByTestId('root');
    expect(root.querySelector('mark')).toBeNull();
    expect(root.textContent).toBe('plain text');
  });
});
