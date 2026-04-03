---
name: tag-me-component-developer
description: Use this skill when building or refining Tag Me frontend UI components such as reusable atoms, molecules, organisms, tag input, feed cards, streak widgets, report cards, search widgets, challenge cards, and upload components.
---

# Tag Me Component Developer

Use this skill for reusable frontend UI components. Focus on typed props, predictable states, and consistency with the product's visual tokens.

## Scope

- Shared atoms, molecules, and larger reusable component blocks
- Tag input and autocomplete UIs
- Feed, diary, streak, report, challenge, circle, and search components
- Upload components that integrate with the existing API layer

## Rules

- Define TypeScript props before implementing complex component logic.
- Cover loading, error, and empty states when the component can surface async data.
- Prefer composition over page-specific branching.
- Keep optimistic update logic in hooks; components should consume the hooks cleanly.
- Respect the existing color tokens and tag palette rather than inventing new colors ad hoc.
- Enforce the tag-input cap of 10 tags in the UI.
- Use `next/image` where image rendering belongs in the component boundary.
- Add accessibility labels, keyboard handling, and adequate color contrast.

## Working Pattern

1. Confirm whether the component belongs at atom, molecule, or organism level.
2. Define props and state transitions, including empty and error behavior.
3. Implement styling with the project's token system.
4. Wire existing API hooks without duplicating server-state logic in the component.

## Tag Me specifics

- Streak, retrospective, and monthly report widgets are first-class UI surfaces.
- Search components need debounced autocomplete and filter controls.
- Feed cards and similar engagement UI often need optimistic like or follow interactions.
