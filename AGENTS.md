# Tag Me Frontend Agents

This project is the frontend for Tag Me. Follow [`DevDock.md`](C:\Users\ndanl\IdeaProjects\tag-me\tag-me-front\DevDock.md) as the product and rendering-strategy source of truth.

## Frontend Baseline

- Next.js App Router
- TypeScript
- TailwindCSS
- React Query for server state
- Zustand for client auth state
- `next/image` and route-level rendering strategy matter

## Available Local Skills

- `tag-me-page-developer`: [`../.codex/skills/tag-me-page-developer/SKILL.md`](C:\Users\ndanl\IdeaProjects\tag-me\.codex\skills\tag-me-page-developer\SKILL.md)
- `tag-me-component-developer`: [`../.codex/skills/tag-me-component-developer/SKILL.md`](C:\Users\ndanl\IdeaProjects\tag-me\.codex\skills\tag-me-component-developer\SKILL.md)
- `tag-me-api-integration`: [`../.codex/skills/tag-me-api-integration/SKILL.md`](C:\Users\ndanl\IdeaProjects\tag-me\.codex\skills\tag-me-api-integration\SKILL.md)
- `tag-me-frontend-reviewer`: [`../.codex/skills/tag-me-frontend-reviewer/SKILL.md`](C:\Users\ndanl\IdeaProjects\tag-me\.codex\skills\tag-me-frontend-reviewer\SKILL.md)

## Skill Routing

- App Router pages, layouts, route metadata, SSR or CSR or ISR decisions, auth redirects, and route-level loading or error handling:
  Use `tag-me-page-developer`
- Shared UI components, feed cards, tag input, streak widgets, search widgets, report cards, and upload widgets:
  Use `tag-me-component-developer`
- React Query hooks, API clients, auth refresh flows, optimistic mutations, and S3 pre-signed upload flows:
  Use `tag-me-api-integration`
- Code review or patch review for frontend changes:
  Use `tag-me-frontend-reviewer`

## Combined Usage Rules

- For a new screen:
  Use `tag-me-page-developer` for the route shell, `tag-me-component-developer` for reusable UI, and `tag-me-api-integration` for server-state wiring
- For interactive feed or search work:
  Use `tag-me-component-developer` and `tag-me-api-integration`
- For review requests:
  Use `tag-me-frontend-reviewer` first. Findings take priority over summaries.

## Tag Me Frontend Constraints

- Follow the route rendering strategy defined in DevDock:
  SSR for public SEO-sensitive pages, CSR for authenticated interactive pages, ISR for selected public cached pages, and API Routes for pre-signed uploads.
- Keep frontend behavior aligned with tag-driven diary, feed, mindmap, search, report sharing, and OAuth flows.
- Use project tokens and conventions rather than ad hoc styling or state management.
- Preserve loading, error, empty, auth-failure, and rate-limit states in user-facing flows.
