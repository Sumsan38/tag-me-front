---
name: task-diff-reviewer
description: Review the current project by reading `task.md`, identifying the active development items, inspecting the current `git diff`, grading the change from A to D, and sharing the review result with the user. Use when Codex needs a repeatable progress-aware code review flow for in-progress backend or frontend work.
---

# Task Diff Reviewer

Use this skill as a fixed review workflow. Read the project task tracker first, then inspect the current diff, then report both progress context and review findings in one response.

## Review Workflow

1. Read `task.md` in the current project root.
2. Identify the active work items.
3. Inspect the current git changes.
4. Review the diff against the task intent and project constraints.
5. Grade the change from `A` to `D`.
6. Share the result with the user.

## Step 1: Read Task Context

- Open `task.md` before reviewing code.
- Identify the section that matches the files or feature currently being changed.
- Separate items into:
  - completed items: checked boxes related to the changed area
  - active items: unchecked items that the diff appears to target now
  - nearby follow-up items: adjacent unchecked items that may create hidden scope or missing work
- If `task.md` is large, summarize only the few lines needed to explain the current work.

## Step 2: Inspect Git Changes

- Check both staged and unstaged changes when relevant.
- Prefer `git diff --stat`, `git diff --name-only`, `git diff`, and `git diff --cached`.
- If there is no diff, say so clearly and stop after reporting that no review target was found.
- Focus on changed files first, then open only the surrounding code needed to confirm behavior.

## Step 3: Review Standards

- Treat this as code review, not implementation.
- Prioritize correctness, regressions, security, architecture fit, and missing tests.
- Use the project's existing review expectations:
  - backend-oriented work: apply the same mindset as `tag-me-backend-reviewer`
  - frontend-oriented work: apply the same mindset as `tag-me-frontend-reviewer`
- Always compare the diff against the intent inferred from `task.md`.
- Flag mismatches such as:
  - code that solves a different problem than the active task
  - partial implementation with missing follow-through
  - tests missing for newly introduced behavior
  - behavior that violates project architecture or rendering rules

## Grade Rubric

- `A`: task intent is clear, diff is coherent, no meaningful defects found, and tests or verification are adequate
- `B`: mostly solid, but there are minor correctness gaps, weak coverage, or moderate follow-up risk
- `C`: important defects, missing validation, or clear mismatch between task intent and implementation
- `D`: blocking correctness or architecture problems, severe regressions, or the change is not review-ready

Never give `A` when there are unresolved findings that could cause a bug or regression.

## Output Format

Present the result in this order:

1. `Progress Summary`
2. `Review Findings`
3. `Grade`

For `Progress Summary`:
- state the active item inferred from `task.md`
- mention any nearby unchecked items that look partially touched or likely omitted

For `Review Findings`:
- list findings first, ordered by severity
- include file and line references whenever possible
- for each finding, state the problem, why it matters, and the concrete fix direction
- if there are no findings, say that explicitly

For `Grade`:
- provide one letter from `A` to `D`
- justify the grade in one to three sentences

## Constraints

- Do not modify files while using this skill unless the user explicitly changes the task from review to implementation.
- Do not bury the grade above the findings. Findings come first.
- Do not score based on style alone.
