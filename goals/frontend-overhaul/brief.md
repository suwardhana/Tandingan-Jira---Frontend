# Jira-Faithful Frontend Overhaul

## Outcome

Transform TaskFlow into a production-grade, Jira-faithful project management UI with drag-and-drop board, responsive design, error handling, loading states, and polished instant-feel performance.

## Context

- **Project:** React 19 + TypeScript + Vite, bun package manager, atomic design (atoms/molecules/organisms/pages).
- **Current state:** 8 mock tasks, 4 users, 2 sprints in `constants.ts`. App runs standalone without backend via fallback + optimistic updates.
- **Styling:** Tailwind via CDN (no build-time purge). Material Symbols Outlined for icons. Inter font.
- **Architecture:** Single state owner in `App.tsx` — all data and handlers live there, passed as props. No state library. **Router will be added** so users can deep-link to views and task details (e.g., `/board`, `/task/PROJ-101`).
- **Key files:** `App.tsx`, `components/pages/BoardView.tsx`, `components/molecules/TaskCard.tsx`, `components/organisms/Sidebar.tsx`, `components/organisms/Header.tsx`, `types.ts`, `constants.ts`.

## Constraints

- App runs from mock data in `constants.ts` during frontend development. Backend integration is a separate future goal.
- No regression on existing views: Board, List, Reports, Team, Settings all must still render correctly.
- Keep bundle size under 200KB gzipped (target: fast initial load, light on memory).

## Non-Goals

- **No backend integration.** This is purely a frontend UX/UI overhaul.
- **No new major features.** Reordering sprints, time tracking, advanced filtering, bulk editing, activity streams, attachments — out of scope.
- **No test suite.** We'll verify manually and with build checks, but writing automated tests is not part of this goal.
- **No offline/PWA.** Service workers and offline mode are out of scope.

## Ask Before

- Adding any dependency with >50KB gzipped overhead.
- Changing the state management architecture (e.g., introducing Redux, Zustand, or Context).
- Replacing or removing any existing view (Board, List, Reports, Team, Settings).
- Destructive operations: deleting files, reorganizing the component directory structure.
- Design decisions that visibly diverge from Jira's interaction patterns.

## Done Means

The app, when opened in a browser at `localhost:3000`, behaves like a Jira project board:

1. Tasks can be dragged between Kanban columns with smooth, Jira-style animations and drop indicators.
2. Every component handles its loading, empty, and error states gracefully — skeletons, toasts, error boundaries.
3. The layout adapts to mobile, tablet, and desktop viewports without breakage or truncation.
4. The visual design matches Jira's density, color tokens, typography, and spacing conventions.
5. Initial page load feels instant (skeleton paint under 200ms) and interactions respond with no visible lag.
