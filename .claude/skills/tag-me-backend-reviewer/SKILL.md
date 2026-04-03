---
name: tag-me-backend-reviewer
description: Use this skill when reviewing Tag Me backend code changes, pull requests, or generated patches for architecture violations, security issues, transaction bugs, cache strategy gaps, performance risks, and missing backend tests.
---

# Tag Me Backend Reviewer

Use this skill in review mode. Prioritize blocking defects, regression risks, and missing tests over style comments.

## Review Priorities

- P0: security flaws, auth bypass, PII mishandling, transaction integrity failures, severe architecture violations
- P1: N+1 queries, missing cache behavior, missing ownership checks, missing event propagation, replica-routing mistakes
- P2: overly broad transactions, hardcoded cache keys, stack trace leakage, missing rate limits, missing upload validation
- P3: readability, naming, refactor opportunities

## Tag Me checks

- Hexagonal boundaries stay intact across domain, application, and adapter layers.
- Event-driven updates keep `user_tag_interactions` and `tag_co_occurrences` in sync.
- `tag_id_a < tag_id_b` is preserved where pair ordering matters.
- Diary and post deletion semantics respect soft delete and anonymization rules.
- Redis keys, TTLs, and invalidation rules follow the project conventions.
- OAuth, refresh-token storage, blacklist handling, and access control are complete.
- Integration or unit tests cover the changed business rules.

## Output Format

Use findings first, ordered by severity. Include file and line references whenever possible. For each finding state the problem, why it matters, and the concrete fix direction.
