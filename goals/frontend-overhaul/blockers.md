# Blockers: Jira-Faithful Frontend Overhaul

## Open Questions

- Which version of Jira should we target visually? (Jira Cloud 2024+ is the assumption — if targeting Jira Server/Data Center, the sidebar and header styling differ.)
- Should task cards show story points / estimation badges? (Jira includes these if enabled in the project. Currently not in the Task type.)
- Should drag-and-drop reorder tasks within a column, or only move between columns? (Both is Jira-default, but within-column ordering requires rank/position state not currently in the data model.)

## Stop And Ask

- If @dnd-kit proves problematic during implementation (browser bugs, accessibility gaps, bundle impact), pause before switching to an alternative like `pragmatic-drag-and-drop` (Atlassian's own library, ~2KB).
- If migrating from Tailwind CDN to build-time Tailwind breaks any existing styles that can't be fixed within 30 minutes of effort, pause and decide whether to revert.
- If the bundle size exceeds 200KB gzipped after Phase 2, pause before adding @dnd-kit and discuss acceptable limits.
- If any existing view (Board, List, Reports, Team, Settings) regresses and the fix isn't obvious within 15 minutes, pause.

## Dangerous Or High-Risk Actions

- **Removing Tailwind CDN from `index.html`** — if the build-time Tailwind setup isn't complete, the entire app unstyled. Do this atomically: configure PostCSS + Tailwind, verify build, then remove CDN.
- **Installing new npm dependencies** — run `bun install` and verify `bun run build` succeeds before making code changes that depend on them.
- **Reorganizing component files** — the atomic design directory structure (`atoms/`, `molecules/`, `organisms/`, `pages/`) should be preserved. If a component doesn't fit cleanly, create it where it fits best and note the decision.
- **Changing types in `types.ts`** — adding fields to `Task` or `User` is fine, but removing or renaming existing fields will cascade through every component. Review all usages before committing type changes.

## Known Blockers

- None currently. Project builds and runs cleanly.
