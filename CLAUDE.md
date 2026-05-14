# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev      # Start dev server on port 3000 (host: 0.0.0.0)
bun run build    # Production build
bun run preview  # Preview production build
```

Package manager is **bun** (v1.3.13+). Lockfile is `bun.lock`.

No test runner or linter is configured.

## Architecture

React 19 + TypeScript + Vite project — a Jira-like project management dashboard (TaskFlow) with Kanban board, list view, reports, and team management.

### Component organization (atomic design)

- `components/atoms/` — Avatar, StatusBadge, PriorityIcon
- `components/molecules/` — TaskCard
- `components/organisms/` — Sidebar, Header, IssueModal, CreateIssueModal, AddMemberModal
- `components/pages/` — BoardView, ListView, ReportsView, TeamView, SettingsView

**Important:** There are stale duplicate files directly in `components/` (e.g., `components/BoardView.tsx`). Use the subdirectory versions only.

### Data flow

`App.tsx` is the single state owner — all data (tasks, users, sprints) and all mutation handlers live there, passed down as props. No state management library.

```
App.tsx (state + handlers)
 ├── Sidebar
 ├── Header
 ├── {BoardView | ListView | ReportsView | TeamView | SettingsView}
 └── Modals (IssueModal, CreateIssueModal, AddMemberModal)
```

### API layer (`api.ts`)

All requests go through a single `api` object. Key patterns:

- **Snake/camel transform:** `fromApi()` converts responses snake_case → camelCase; `toApi()` converts requests camelCase → snake_case. Recursive — handles nested objects and arrays.
- **Base URL:** `VITE_API_BASE_URL` env var, default `http://localhost:3344/api`
- **Mutations use optimistic updates** in App.tsx — local state is updated before the API call, with no rollback on failure (only `console.error`).

### Styling

- Tailwind CSS via CDN (configured in `index.html`), NOT PostCSS/build-time Tailwind
- Dark mode via `.dark` class on `<html>` (configured `darkMode: 'class'` in Tailwind config)
- Custom colors: `dark:bg-dark-bg` (#0f172a), `dark:bg-dark-surface` (#1e293b), `dark:border-dark-border` (#334155)
- Icons: Material Symbols Outlined (Google Fonts), with `.material-symbols-outlined` and `.fill-icon` classes
- Font: Inter (Google Fonts)

### Key types (`types.ts`)

Enums: `Priority`, `Status`, `IssueType` (string values, not numeric).
Interfaces: `User`, `Task`, `Sprint`, `Comment`, `Subtask`.
`ViewMode` = `'board' | 'list' | 'reports' | 'team' | 'settings'`.

### Path aliases

`@/` maps to project root (configured in both `vite.config.ts` and `tsconfig.json`).

### Import maps

`index.html` uses `<script type="importmap">` to resolve `react`, `react-dom`, and `recharts` from `esm.sh` CDN. This is unconventional — packages are still in `node_modules` via npm, but the browser resolves them from CDN.

### Environment

- `VITE_API_BASE_URL` — backend API URL (set in `.env`)
- `GEMINI_API_KEY` — injected via Vite `define` as `process.env.GEMINI_API_KEY`

### Recharts for charts

Used in `ReportsView` — bar charts, pie charts for sprint progress and ticket distribution.

## Gotchas

- **No error boundaries, no loading states** — errors are logged to console only
- **Client-side ID generation** (`t${Date.now()}`) — backend may overwrite
- **Comment/subtask support** is wired up in api.ts and App.tsx handlers
- **`bun.lock`** is the lockfile — no `package-lock.json`

See `AGENTS.md` for detailed component patterns, modal structure, drag-and-drop implementation, and common development tasks.
