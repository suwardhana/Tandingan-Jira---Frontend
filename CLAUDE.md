# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev        # Start dev server on port 3000 (host: 0.0.0.0)
bun run build      # Production build to dist/
bun run preview    # Preview production build
bun run lint       # ESLint v9 flat config
bun run lint:fix   # ESLint auto-fix
bun run format     # Prettier format all files (100 chars, double quotes, trailing commas)
bun run format:check  # Prettier dry-run check
```

Package manager is **bun** (lockfile: `bun.lock`). Do NOT use npm. All scripts use `bunx --bun vite` under the hood.

**ESLint v9** flat config (`eslint.config.js`) + **Prettier v3** with `prettier-plugin-tailwindcss` (auto-sorts classes). `@typescript-eslint/no-explicit-any` is off. Unused vars starting with `_` are ignored.

## Architecture

React 19 + TypeScript 6 + Vite 8 — a Jira-like project management dashboard (TaskFlow) with Kanban board, list view, reports, team management, and settings.

**Key deps:** `@dnd-kit/core` + `@dnd-kit/sortable` (drag-and-drop), `react-router-dom` v7 (URL-based routing), `recharts` (charts), `marked` + `sanitize-html` (markdown rendering in IssueModal).

### Routing (react-router-dom v7)

`App.tsx` wraps everything in `<BrowserRouter>`. Views and modals are URL-driven, not state-driven:

| URL                                                 | Renders                                          |
| --------------------------------------------------- | ------------------------------------------------ |
| `/`                                                 | Redirect to `/board`                             |
| `/board`, `/list`, `/reports`, `/team`, `/settings` | Main views                                       |
| `/board/task/:taskKey`                              | Board + IssueModal overlay (board stays mounted) |
| `/list/task/:taskKey`                               | List + IssueModal overlay                        |
| `?create=true`                                      | Opens CreateIssueModal                           |

`AppLayout` uses `useLocation().pathname` for `currentView`. Modals are driven by URL params — browser back button works correctly for closing them.

### Component organization (atomic design)

```
components/
├── atoms/         Avatar, StatusBadge, PriorityIcon, Skeleton
├── molecules/     TaskCard, MarkdownEditor, NewSprintDialog
├── organisms/     Sidebar, Header, IssueModal, CreateIssueModal, AddMemberModal, ErrorBoundary, Toast
└── pages/         BoardView, ListView, ReportsView, TeamView, SettingsView
```

### Data flow

`App.tsx` is the **single state owner** — no Redux, Zustand, or Context. All data and mutation handlers live in `AppLayout` and are passed down as props.

```
AppLayout (state + handlers)
 ├── Sidebar     ← currentView, onViewChange, isDark, toggleTheme, currentUser
 ├── Header      ← currentView, onCreateClick, sprints, currentSprintId
 ├── {BoardView | ListView | ReportsView | TeamView | SettingsView}
 ├── IssueModal         ← selectedTask (URL-derived), onUpdateTask, onAddComment
 ├── CreateIssueModal   ← showCreate (URL-derived), onCreate, users, sprints
 └── AddMemberModal     ← local isAddMemberModalOpen state
```

**Startup:** `useEffect` on mount → parallel `api.fetchUsers/Tasks/Sprints()`. On failure → falls back to `constants.ts` mock data. `dataReady` flag controls skeleton vs real content.

**Mutations:** Optimistic updates — local state updated immediately, API call follows. On API failure, toast shows warning; **no rollback**. Client-side IDs are generated (`t${Date.now()}`) and replaced when the backend returns the real task.

**Memoization:** `React.memo` on most components (TaskCard, BoardView, ListView, etc.), `useCallback` on all mutation handlers, `useMemo` on derived data.

### Skeleton Loading

`dataReady` drives skeleton vs content. Variants in `components/atoms/Skeleton.tsx`: `SkeletonBoard`, `SkeletonTable`, `SkeletonReports`, plus smaller primitives (`SkeletonCard`, `SkeletonText`, `SkeletonAvatar`). All match final content dimensions to prevent layout shift.

### Drag & Drop (@dnd-kit)

BoardView uses `@dnd-kit/core` + `@dnd-kit/sortable`:

- `DndContext` wraps the board with `rectIntersection` collision detection
- Each column is a `useDroppable` zone (keyed by `Status` enum)
- Each card uses `useSortable` for vertical reorder within a column
- `DragOverlay` renders a floating copy during drag
- `PointerSensor` with 8px activation distance, `TouchSensor` with 250ms delay
- On cross-column drop → `onTaskUpdate(taskId, { status, order })`
- On same-column drop → `onReorder(status, orderedIds)` via `arrayMove`

### Toast Notifications

`ToastProvider` wraps the app, `useToast()` hook provides `toast(message, type)` with types `"success" | "warning" | "error" | "info"`. Auto-dismiss after 4s, stacked bottom-right.

### ErrorBoundary

Class-based React error boundary in `components/organisms/ErrorBoundary.tsx`, wrapping each page view. `key={viewKey}` resets it on view change. Shows error state with reload and retry buttons.

### API layer (`api.ts`)

All requests go through a single `api` object:

- `fetchUsers()`, `createUser(user)`
- `fetchSprints()`, `createSprint(sprint)`
- `fetchTasks()`, `createTask(task)`, `updateTask(id, updates)`, `deleteTask(id)`
- `fetchSubtasks(taskId)`, `createSubtask(taskId, subtask)`, `updateSubtask(id, updates)`, `deleteSubtask(id)`
- `fetchComments(taskId)`, `createComment(taskId, comment)`, `updateComment(id, updates)`, `deleteComment(id)`

**Snake/camel transform:** `fromApi()` converts responses snake_case → camelCase; `toApi()` converts requests camelCase → snake_case. Recursive — handles nested objects and arrays. Base URL from `VITE_API_BASE_URL` (default `http://localhost:3344/api`).

## Styling

### Tailwind (build-time via PostCSS, NOT CDN)

Tailwind CSS 3 is processed by PostCSS. Config at `tailwind.config.js` with Jira design tokens: `jira-blue`, `jira-sidebar`, `jira-green`, `jira-red`, `jira-yellow`, `jira-teal`, `jira-purple`, plus surface/text semantic colors and custom shadows (`card`, `card-hover`, `card-dragging`, `modal`, `dropdown`). Plugins: `@tailwindcss/forms`, `@tailwindcss/typography`, `@tailwindcss/aspect-ratio`, `@tailwindcss/line-clamp`.

### Dark mode

`darkMode: "class"` — `<html class="dark">` toggled by `isDark` state in App.tsx. Default is dark (hardcoded in `index.html`). Every surface needs both light and dark variants:

```
bg-white dark:bg-dark-bg text-slate-900 dark:text-white border-gray-200 dark:border-dark-border
```

### Icons & fonts

Material Symbols Outlined + Inter, both loaded from Google Fonts CDN in `index.html`. Usage: `<span class="material-symbols-outlined">settings</span>`. `.fill-icon` for filled variant. These classes are defined in `index.css` — do not remove them.

### View transitions

`<meta name="view-transition" content="same-origin" />` enables crossfade (200ms) on view switches in Chromium browsers. Gracefully degrades in Firefox/Safari. Reduced-motion respected.

### Responsive breakpoints

| Width      | Sidebar           | Board                | Modals         |
| ---------- | ----------------- | -------------------- | -------------- |
| <768px     | Hamburger overlay | Stacked, snap scroll | Full-screen    |
| 768-1023px | Icon-only (56px)  | Horizontal scroll    | Centered sheet |
| ≥1024px    | Full (224px)      | Horizontal scroll    | Centered sheet |

## Key types (`types.ts`)

`Priority`, `Status`, `IssueType` are string enums (not numeric). Use directly in comparisons. `Task` includes `comments?`, `subtasks?`, `attachments?`. `Sprint.status` is `"active" | "future" | "closed"`. `ViewMode` = `'board' | 'list' | 'reports' | 'team' | 'settings'`.

## Import maps (unconventional)

`index.html` uses `<script type="importmap">` to resolve `react`, `react-dom`, and `recharts` from `esm.sh` CDN — even though they're in `node_modules`. The browser resolves these from CDN at runtime. Other packages (`@dnd-kit/*`, `react-router-dom`, etc.) resolve normally through node_modules/Vite. When adding React ecosystem deps, check if they need importmap entries.

## Environment

- `VITE_API_BASE_URL` — backend API URL (set in `.env`, default `http://localhost:3344/api`)
- `GEMINI_API_KEY` — injected via Vite `define` as `process.env.GEMINI_API_KEY` and `process.env.API_KEY`

## Path aliases

`@/` maps to project root (configured in `vite.config.ts` and `tsconfig.json`).

## Gotchas

- **No tests** — no test framework, no test files, no test scripts.
- **No rollback on optimistic updates** — if API call fails, UI can get out of sync with reality.
- **Client-side ID generation** (`t${Date.now()}`) — backend may overwrite these. The returned task replaces the optimistic one by matching on client-generated ID.
- **`useSortable` requires string IDs** — if task IDs become numeric, they need `String()` conversion.
- **Dark mode is default** — `<html class="dark">` hardcoded in `index.html`.
- **No offline icon fallback** — Material Symbols and Inter load from Google Fonts CDN.
- **`bun.lock`** is the lockfile — no `package-lock.json`.
- **Vite dev server binds to 0.0.0.0** — accessible from other devices on the local network.
- **KeyboardSensor included by default** with dnd-kit — don't disable it.
- **`.prettierignore` excludes `dist`, `node_modules`, `bun.lock`, `goals`**.

See `AGENTS.md` for additional detail on component patterns, modal structure, and common development tasks.
