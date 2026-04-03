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
