---
name: tag-me-test-writer
description: Use this skill when writing or expanding Tag Me backend integration tests with Spring Boot, H2, MockMvc, mocked infrastructure beans, shared IntegrationTestSupport setup, and coverage-focused tests for service, repository, or controller behavior.
---

# Tag Me Test Writer

Use this skill for backend integration testing. This skill is for Spring Boot integration tests, not pure domain unit tests.

## Scope

- `@SpringBootTest` integration tests
- `IntegrationTestSupport` setup
- Repository, service, and controller integration coverage
- Mocked Redis, Elasticsearch, or other infrastructure collaborators

## Rules

- Domain-only tests belong elsewhere; keep this skill focused on integration behavior.
- Use `@ActiveProfiles("test")` and rollback-friendly transactional setup.
- Prefer H2 or the project's configured test database profile for integration coverage.
- Replace Redis and Elasticsearch collaborators with mocks when full integration is unnecessary.
- Use MockMvc when validating controller security or request/response behavior.
- Test data should be created inside the test, not through hidden external fixtures.
- Verify mocked collaborator interactions when the behavior matters.

## Tag Me specifics

- Cover event consistency for likes, comments, and co-occurrence tracking.
- Validate mindmap aggregation behavior, source filtering, and source-priority rules.
- Check auth failure cases, token expiry, ownership enforcement, and OAuth state validation.
- Test upload validation for 10MB and 10-file limits plus allowed MIME types.
- Test account deletion and monthly report sharing behavior.

## Working Pattern

1. Choose the layer under test and the required Spring test style.
2. Build the minimal shared setup in `IntegrationTestSupport`.
3. Write behavior-focused integration tests with clear names.
4. Confirm coverage on the business-critical paths touched by the change.
