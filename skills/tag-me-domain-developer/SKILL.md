---
name: tag-me-domain-developer
description: Use this skill when implementing or modifying the Tag Me backend domain layer, including aggregates, entities, value objects, domain events, invariants, and pure unit tests that must not depend on Spring or infrastructure code.
---

# Tag Me Domain Developer

Use this skill for pure domain modeling. Stay inside the domain layer and avoid infrastructure dependencies entirely.

## Scope

- Aggregates, entities, value objects, enums, and domain events
- Invariants and state-transition rules
- Pure JUnit tests for domain behavior

## Rules

- No Spring, JPA, Redis, Elasticsearch, or framework-specific dependencies.
- Aggregates control their internal entities and emit domain events on meaningful state changes.
- Value objects are immutable and validate themselves at construction time.
- Domain events include the payload needed by downstream handlers without forcing re-queries.
- Tests are pure unit tests and should focus on invariants, transitions, and emitted events.

## Tag Me specifics

- Diary tags are capped at 10 and mood stays in the 1 to 5 range.
- Deleted diaries or posts cannot be mutated.
- Tag names must be valid and unique according to domain rules.
- Circle and challenge concepts are tag-set based, not a single tag foreign key.
- Co-occurrence pairs must preserve `tag_id_a < tag_id_b`.
- Event payloads for diary, like, and comment flows should include the tag data needed later.

## Working Pattern

1. Write down the invariants before coding.
2. Model the aggregate root and related value objects or entities.
3. Add the domain event shape required by downstream application logic.
4. Ship unit tests with the implementation.
