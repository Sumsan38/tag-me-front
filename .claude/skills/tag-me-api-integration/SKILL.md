---
name: tag-me-api-integration
description: Use this skill when implementing or reviewing Tag Me frontend API integration code such as React Query hooks, API client modules, response types, optimistic updates, auth token refresh flows, S3 pre-signed upload flows, and domain-specific query or mutation hooks.
---

# Tag Me API Integration

Use this skill for frontend data-fetching and mutation flows. Prefer consistent React Query patterns, typed API envelopes, and resilient auth handling.

## Scope

- API client setup with `fetch` or `axios`
- React Query hooks for list, detail, search, upload, and report features
- Auth refresh handling with HttpOnly refresh cookies and in-memory access tokens
- Optimistic UI for likes, tag actions, and similar low-risk mutations
- S3 pre-signed upload flows

## Rules

- Match backend responses to a typed `ApiResponse<T>` envelope.
- Use cursor pagination for feeds and search where the backend exposes cursors.
- Align `staleTime` with server cache TTLs when the domain has explicit TTL rules.
- Handle `401` with one refresh attempt and retry; if refresh fails, clear auth state and redirect to login.
- Handle `403`, `429`, and domain error codes with explicit UI behavior.
- Keep auth state minimal in Zustand or the project store; do not persist sensitive tokens insecurely.
- Use optimistic updates only when rollback is straightforward.
- Upload flow is: request pre-signed URL, upload directly to S3, then use the returned object key or CDN URL.
- Account deletion should clear client auth state and query caches.

## Working Pattern

1. Identify the domain API surface and corresponding query keys.
2. Define or update response and payload types first.
3. Implement query or mutation hooks, including loading, error, and invalidation behavior.
4. Verify retry, refresh, optimistic rollback, and cache-clearing paths.

## Tag Me specifics

- Support Google and Kakao OAuth callback flows.
- Autocomplete and trending hooks should respect known cache durations.
- Monthly report sharing uses a share URL with Open Graph-ready metadata.
