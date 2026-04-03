---
name: tag-me-service-developer
description: Use this skill when implementing or changing Tag Me backend application-layer code such as use case ports, outbound ports, DefaultXxxService classes, domain-event listeners, transaction boundaries, cache invalidation, and service-level integration tests.
---

# Tag Me Service Developer

Use this skill for backend application-layer work. Define ports first, then implement services and event orchestration around them.

## Scope

- Inbound and outbound port interfaces
- `DefaultXxxService` application services
- Domain-event listeners and orchestration logic
- Service-layer cache invalidation and integration tests

## Rules

- Define use case ports before implementing services.
- Service implementations follow the `Default` naming convention when that is the project pattern.
- Write operations use `@Transactional`; read operations use `@Transactional(readOnly = true)`.
- Event listeners should run after commit and asynchronously when that matches existing infrastructure.
- Cache invalidation belongs in the service layer, not the controller layer.
- Event payloads should be rich enough to avoid unnecessary DB re-queries in handlers.
- Preserve pair ordering and source-priority rules in tag interaction logic.
- Follow account-deletion behavior for diary deletion, post anonymization, PII removal, and Redis cleanup.

## Tag Me specifics

- `primarySource` priority is `diary > post > comment > like`.
- `tag_co_occurrences` inserts keep `tag_id_a < tag_id_b`.
- Report-sharing flows return CloudFront-backed URLs with social preview support.
- Service tests should mock Redis and Elasticsearch integrations where needed.

## Working Pattern

1. Add or update the relevant ports.
2. Implement the `DefaultXxxService` flow and transaction boundaries.
3. Add listener or cache behavior required by the use case.
4. Ship integration tests with the service change.
