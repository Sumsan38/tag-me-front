---
name: tag-me-adapter-developer
description: Use this skill when working on the Tag Me backend adapter layer, including REST controllers, Spring Batch adapters, JPA or MyBatis persistence adapters, Redis or Elasticsearch adapters, S3 and push integrations, Flyway migrations, and API endpoint design.
---

# Tag Me Adapter Developer

Use this skill for backend code in the adapter layer only. Keep controllers thin, implement ports in adapters, and keep business logic in the application or domain layers.

## Scope

- Inbound adapters: web controllers, batch entrypoints, event listeners
- Outbound adapters: JPA repositories, persistence adapters, Redis adapters, Elasticsearch adapters, S3 clients, FCM push adapters
- Supporting infrastructure: Flyway migrations, API response mapping, data source routing

## Rules

- Controllers translate HTTP only. Do not place business logic in controllers.
- Inject inbound ports or use cases, not concrete services when a port exists.
- Protect authenticated endpoints with Spring Security and enforce diary ownership checks.
- API responses follow `{ success, data, error, timestamp }` with domain error codes.
- Feed and search pagination should default to cursor-based patterns.
- JPA read paths should honor `@Transactional(readOnly = true)` routing. MyBatis aggregate queries stay on the read replica.
- Persistence adapters implement outbound ports; repositories remain infrastructure details.
- Soft-deleted rows must be excluded consistently.
- Pre-signed upload endpoints must validate file count, size, and MIME type before issuing URLs.
- Batch jobs cover daily streaks, hourly trending tags, and monthly report generation.
- Flyway migrations should include rollback scripts when the project convention expects them.

## Working Pattern

1. Confirm the target port and adapter boundary before editing code.
2. Add or update controller or adapter code without leaking domain rules outward.
3. Verify security, validation, pagination, and response envelope behavior.
4. Add or update integration tests for adapter behavior.

## Tag Me specifics

- Support Google and Kakao OAuth flows where auth adapters are involved.
- Keep `tag_id_a < tag_id_b` ordering intact in tag co-occurrence persistence.
- Monthly report delivery is S3 storage plus CloudFront URL sharing metadata.
