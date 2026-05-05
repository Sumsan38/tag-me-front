---
name: tag-me-frontend-reviewer
description: Use this skill when reviewing Tag Me frontend pages, components, or API integration code for rendering-strategy mistakes, token misuse, accessibility issues, security risks, performance regressions, and missing loading or error states.
---

# Tag Me Frontend Reviewer

Use this skill for frontend review work. Focus on correctness, rendering strategy, accessibility, and UX regressions before stylistic comments.

## Review Priorities

- P0: token or auth leakage, XSS vectors, unsafe HTML injection, severe product-rule violations
- P1: wrong SSR or CSR strategy, missing optimistic updates where expected, missing loading or empty states, direct image rendering without project conventions
- P2: stale cache settings, missing auth-refresh handling, missing accessibility metadata, weak typing
- P3: component decomposition, unnecessary effects, search or debounce polish

## Tag Me checks

- Public pages that need SEO should stay SSR or ISR as designed.
- Protected pages should not leak user data during unauthenticated rendering.
- Search, tag autocomplete, and feed interactions should feel responsive and state-safe.
- Visual tokens should come from the project design system rather than hardcoded random colors.
- Account deletion should clear cached user data.
- Upload and report-sharing flows should follow the defined product behavior.

## Output Format

Present findings first with severity, file reference, problem, reason, and concrete fix direction.

## Codex 병행 리뷰 (필수)

이 스킬은 단독 리뷰로 끝내지 않는다. 1차 리뷰 결과를 정리한 직후 반드시 Codex(`codex:rescue` 스킬)에게 동일 변경 범위에 대한 2차 리뷰를 요청한다.

- 호출 시점: 1차 리뷰 출력 직후, 사용자가 수정 항목을 결정하기 전.
- 호출 방법: `codex:rescue` 스킬을 실행하고, 변경된 파일 경로 목록 + 1차 리뷰에서 짚은 핵심 항목을 함께 전달한다. Codex가 1차에서 놓친 P0/P1을 별도로 잡아낼 수 있도록, 우리의 결론을 그대로 따라달라고 지시하지 말고 독립적인 시각으로 검토를 요청한다.
- 결과 통합: Codex의 지적 사항을 본 리뷰 출력에 별도 섹션(`### Codex 2차 리뷰`)으로 병합하고, 중복되는 항목과 새로 발견된 항목을 구분해 사용자에게 보고한다.
- 예외: 변경 범위가 README/주석 같은 비코드 파일에 한정될 때만 Codex 호출을 생략할 수 있으며, 생략 사유를 보고에 명시한다.
