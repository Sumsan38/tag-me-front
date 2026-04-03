---
name: tag-me-page-developer
description: Use this skill when implementing or modifying Tag Me Next.js App Router pages, route layouts, metadata, and page-level rendering strategy decisions such as SSR, CSR, ISR, auth redirects, SEO metadata, and route-level loading or error handling.
---

# Tag Me Page Developer

Use this skill for page or route work in the Next.js frontend. Decide rendering strategy explicitly and keep route-level behavior coherent.

## Scope

- App Router pages, nested layouts, metadata, and route handlers
- SSR, CSR, and ISR decisions
- Route-level auth checks, redirects, loading, and error handling

## Rules

- Public SEO-sensitive pages should be server-rendered unless the project explicitly says otherwise.
- Interactive authenticated pages can stay client-rendered when that simplifies stateful UX.
- ISR pages should declare their revalidation window clearly.
- Public pages should implement `generateMetadata()` with Open Graph support when relevant.
- Auth-required routes should redirect before leaking protected UI.
- Use `next/image` and configure remote patterns for CDN-hosted images.
- Design for mobile-first layouts.

## Tag Me specifics

- Feed, public profiles, challenges, and circles are SEO-sensitive.
- Diary, mindmap, search, login, and registration routes have explicit rendering expectations in the project conventions.
- The pre-signed URL flow belongs in an API route, not a page component.
- Monthly report share images may require Open Graph-ready metadata or image generation.

## Working Pattern

1. State the intended rendering mode for the route.
2. Implement the page and route-level metadata together.
3. Add loading, error, and empty handling.
4. Verify auth redirects and responsive behavior.
