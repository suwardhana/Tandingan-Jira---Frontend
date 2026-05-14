# AGENTS.md - TaskFlow Jira Frontend

## Overview

React 19 + TypeScript + Vite project — a Jira-faithful project management dashboard (TaskFlow) with Kanban board, list view, reports, team management, and settings.

**Key technologies:**
- React 19.2.6, TypeScript 6.0, Vite 8
- **bun** package manager (v1.3.13+, lockfile: `bun.lock`)
- Build-time Tailwind CSS 3 via PostCSS (NOT CDN)
- @dnd-kit (drag-and-drop Kanban)
- react-router-dom v7 (URL-based routing)
- Recharts (data visualization)
- ESLint v9 flat config + Prettier v3 (prettier-plugin-tailwindcss)

## Commands

```bash
bun run dev           # Dev server on port 3000 (host: 0.0.0.0)
bun run build         # Production build to dist/
bun run preview       # Preview production build
bun run lint          # ESLint (flat config)
bun run lint:fix      # ESLint auto-fix
bun run format        # Prettier format all files
bun run format:check  # Prettier dry-run check
```

All commands use `bunx --bun vite` under the hood. Do NOT use npm.

## Project Structure

```
├── App.tsx                       # Single state owner + router wrapper
├── index.tsx                     # React entry point
├── index.html                    # HTML template (importmaps for CDN react/recharts)
├── index.css                     # Tailwind directives + global styles
├── api.ts                        # API layer (snake_case ↔ camelCase)
├── types.ts                      # TypeScript types/enums
├── constants.ts                  # Mock data fallback
├── tailwind.config.js            # Tailwind config (Jira tokens, plugins)
├── postcss.config.js             # PostCSS: tailwindcss + autoprefixer
├── vite.config.ts                # Vite: port 3000, @ alias, GEMINI_API_KEY injection
├── tsconfig.json                 # TypeScript: ES2022, bundler resolution, @ alias
├── eslint.config.js              # ESLint v9 flat config
├── prettier.config.js            # Prettier + prettier-plugin-tailwindcss
├── .env                          # VITE_API_BASE_URL (default: localhost:3344/api)
└── components/
    ├── atoms/                    # Avatar, StatusBadge, PriorityIcon, Skeleton
    ├── molecules/                # TaskCard
    ├── organisms/                # Sidebar, Header, IssueModal, CreateIssueModal,
    │                             #   AddMemberModal, ErrorBoundary, Toast
    └── pages/                    # BoardView, ListView, ReportsView, TeamView, SettingsView
```

**No duplicate files exist** — the only component directories are `atoms/`, `molecules/`, `organisms/`, `pages/`.

## Architecture & Data Flow

### Routing (react-router-dom v7)

`App.tsx` wraps everything in `<BrowserRouter>`. Routes:

| URL | Renders |
|-----|---------|
| `/` | Redirect to `/board` |
| `/board`, `/list`, `/reports`, `/team`, `/settings` | Main views |
| `/board/task/:taskKey` | Board + IssueModal overlay (board stays mounted) |
| `/list/task/:taskKey` | List + IssueModal overlay |
| `?create=true` | Opens CreateIssueModal on current view |

**Critical:** Views are URL-derived, not state. `AppLayout` reads `useLocation().pathname` to determine `currentView`. Modals are driven by URL params — `taskKey` from path segments, `showCreate` from `?create=true` search param. Browser back button works correctly for closing modals.

### State Management

`App.tsx` is the **single state owner** — no Redux, Zustand, or Context for data. All data and mutation handlers live in `AppLayout` and are passed as props.

State flow:
1. `useEffect` on mount → parallel `api.fetchUsers/Tasks/Sprints()`
2. On API failure → falls back to `constants.ts` mock data (`USERS`, `TASKS`, `SPRINTS`)
3. `dataReady` flag controls skeleton vs real content rendering
4. Mutations use **optimistic updates** — local state updated immediately, then API call follows. On failure, toast shows warning; no rollback.

### Data Loading & Fallback

```typescript
// App.tsx pattern:
try {
  const [users, tasks, sprints] = await Promise.all([...])
} catch {
  console.warn("API unavailable — using mock data")
  setUsers(USERS); setTasks(TASKS); setSprints(SPRINTS)
} finally {
  setDataReady(true)
}
```

The app runs standalone without a backend via this fallback. All mock data is in `constants.ts`.

### Component Props Flow

```
AppLayout (state + handlers)
 ├── Sidebar     ← currentView, onViewChange, isDark, toggleTheme, currentUser
 ├── Header      ← currentView, onCreateClick, sprints, currentSprintId, etc.
 ├── {BoardView | ListView | ReportsView | TeamView | SettingsView}
 │    ← tasks, users, onTaskClick, onCreateClick, etc.
 ├── IssueModal          ← selectedTask (URL-derived), onUpdateTask, onAddComment, etc.
 ├── CreateIssueModal    ← showCreate (URL-derived), onCreate, users, sprints
 └── AddMemberModal      ← local state isAddMemberModalOpen, onAdd
```

### Drag & Drop (@dnd-kit)

BoardView uses `@dnd-kit/core` + `@dnd-kit/sortable`:

- `DndContext` wraps the board with `rectIntersection` collision detection
- Each column is a `useDroppable` zone (keyed by `Status` enum)
- Each card is wrapped in `useSortable` for vertical reorder within a column
- `DragOverlay` renders a floating copy during drag
- `PointerSensor` with 8px activation distance, `TouchSensor` with 250ms delay
- `KeyboardSensor` for accessibility (included by default)
- On drop across columns → `onTaskUpdate(taskId, { status, order })`
- On drop within column → `onReorder(status, orderedIds)` via `arrayMove`
- Pessimistic: status change fires immediately in state; order is recalculated

**Important:** `useSortable` requires item IDs as strings. If task IDs contain special characters, they may need sanitization.

## Design Tokens & Styling

### Tailwind (build-time, NOT CDN)

Tailwind is processed by PostCSS, not loaded from CDN. Config at `tailwind.config.js`:

**Jira design tokens:**
- `jira-blue: #0052CC`, `jira-blue-hover: #0747A6`
- `jira-sidebar: #0747A6`, `jira-sidebar-hover: #1C3D6E`, `jira-sidebar-active: #2A5295`
- `jira-green: #36B37E`, `jira-red: #FF5630`, `jira-yellow: #FFAB00`
- `jira-teal: #00B8D9`, `jira-purple: #6554C0`

**Surface/text colors:**
- `surface: #F4F5F7`, `surface-hover: #EBECF0`, `surface-raised: #FFFFFF`, `surface-dark: #1E293B`
- `text-primary: #172B4D`, `text-secondary: #5E6C84`, `text-subtle: #8993A4`, `text-link: #0052CC`

**Dark mode:** `dark-bg: #0f172a`, `dark-surface: #1e293b`, `dark-border: #334155`

**Custom shadows:** `card`, `card-hover`, `card-dragging`, `modal`, `dropdown`

**Custom border radius:** `card: 3px` (Jira's subtle rounded corners)

**Plugins:** `@tailwindcss/forms`, `@tailwindcss/typography`, `@tailwindcss/aspect-ratio`, `@tailwindcss/line-clamp`

### Dark Mode

`darkMode: "class"` — `<html>` gets `.dark` class toggled. Default is dark (`<html class="dark">` in `index.html`). Theme toggle in `App.tsx` via `isDark` state.

### Icons

Google Fonts Material Symbols Outlined, loaded in `index.html`. Usage:
```html
<span class="material-symbols-outlined">settings</span>
<span class="material-symbols-outlined fill-icon">home</span>  <!-- filled variant -->
```

### Custom CSS (`index.css`)

- `material-symbols-outlined` class: sets font variation settings, size
- `fill-icon` class: sets `FILL 1` for filled icon style
- Custom scrollbar styles (WebKit only)

### View Transitions

`<meta name="view-transition" content="same-origin" />` in `index.html` for crossfade on view switches. CSS animation duration set to 200ms with reduced-motion respect.

## Key Types (`types.ts`)

```typescript
enum Priority { LOW = "Low", MEDIUM = "Medium", HIGH = "High", CRITICAL = "Critical" }
enum Status { TODO = "To Do", IN_PROGRESS = "In Progress", REVIEW = "Review", DONE = "Done" }
enum IssueType { TASK = "Task", BUG = "Bug" }

interface User { id, name, avatar, email, role? }
interface Comment { id, userId, text, createdAt }
interface Subtask { id, taskId, title, completed, createdAt?, updatedAt? }
interface Sprint { id, name, startDate, endDate, goal, status: "active" | "future" | "closed" }
interface Task {
  id, key, title, description, status, priority, type,
  assigneeId?, reporterId, sprintId, dueDate?, createdAt, updatedAt,
  order?, labels: string[], comments?: Comment[], subtasks?: Subtask[],
  attachments?: { name, size, type }[]
}

type ViewMode = "board" | "list" | "reports" | "team" | "settings"
```

Enum values are string literals, not numeric — use them directly in comparisons and switch statements.

## API Layer (`api.ts`)

All endpoints go through a single `api` object with automatic snake_case ↔ camelCase conversion:

```typescript
import { api } from "./api"
const tasks = await api.fetchTasks()
const created = await api.createTask({ title: "Foo", status: Status.TODO })
```

**Available methods:**
- `fetchUsers()`, `createUser(user)`
- `fetchSprints()`, `createSprint(sprint)`
- `fetchTasks()`, `createTask(task)`, `updateTask(id, updates)`, `deleteTask(id)`
- `fetchSubtasks(taskId)`, `createSubtask(taskId, subtask)`, `updateSubtask(id, updates)`, `deleteSubtask(id)`
- `fetchComments(taskId)`, `createComment(taskId, comment)`, `updateComment(id, updates)`, `deleteComment(id)`

**Base URL:** `VITE_API_BASE_URL` env var (default `http://localhost:3344/api`)

**Key transformation:** `fromApi()` converts responses snake_case→camelCase, `toApi()` converts requests camelCase→snake_case. Recursive — handles nested objects and arrays.

## Component Patterns

### Modals

All modals follow the same pattern:
```tsx
{/* Backdrop */}
<div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
  {/* Content container */}
  <div className="relative flex h-full max-h-full w-full ... sm:max-w-4xl sm:rounded-xl">
    {/* Header with close button */}
    {/* Scrollable content */}
  </div>
</div>
```

- Full-screen on mobile, centered sheet on desktop (sm: breakpoint)
- `animate-[fadeIn_0.2s_ease-out]` for entry animation
- Modal toggled via `if (!isOpen) return null` (unmounts when closed)

### Skeleton Loading

`dataReady` drives skeleton vs content. Skeleton variants in `components/atoms/Skeleton.tsx`:
- `SkeletonBoard` — sprint header + 4 columns with cards
- `SkeletonTable` — header + N rows
- `SkeletonReports` — 3 metric cards + 2 chart areas
- `SkeletonCard`, `SkeletonColumn`, `SkeletonText`, `SkeletonAvatar`, `SkeletonMetric`

All skeletons match final content dimensions (no layout shift). Uses a custom `shimmer` gradient animation.

### Toast Notifications

`ToastProvider` wraps the app, `useToast()` hook provides `toast(message, type)`:
```tsx
const { toast } = useToast()
toast("Issue created", "success")
toast("Saved locally", "warning")
```

Types: `"success" | "warning" | "error" | "info"`. Auto-dismiss after 4s. Stacked bottom-right.

### ErrorBoundary

Class-based React error boundary wrapping each page view in `App.tsx`:
```tsx
<ErrorBoundary key={viewKey}>
  {renderContent()}
</ErrorBoundary>
```

Shows error state with "Reload page" and "Try again" buttons. `key={viewKey}` resets boundary on view change.

### Memoization Pattern

`React.memo` is used on: TaskCard, SortableCard, DroppableColumn, BoardView, ListView, ReportsView, TeamView, Sidebar, Header, IssueModal, CreateIssueModal, Avatar, StatusBadge, PriorityIcon.

`useCallback` wraps all mutation handlers in AppLayout.

`useMemo` wraps `selectedTask`, `sprintTasks`, ticket distribution data.

## Styling Conventions

- **Dark mode:** Every UI surface needs both light and dark variants:
  ```tsx
  className="bg-white dark:bg-dark-bg text-slate-900 dark:text-white border-gray-200 dark:border-dark-border"
  ```
- **Interactive elements:** Use `transition-colors` for hover states, `active:scale-95` for buttons
- **Typography:** `text-xs font-bold uppercase tracking-wider` for labels, `text-sm font-semibold` for clickable items
- **Spacing:** px-3 (mobile), sm:px-6 (desktop) pattern for page padding
- **Scrolling:** `custom-scrollbar` class on scrollable containers + WebKit scrollbar styles in index.css
- **Touch:** `touch-manipulation` on draggable cards to prevent scroll interference

## Responsive Breakpoints

| Width | Sidebar | Board | Modals | Header |
|-------|---------|-------|--------|--------|
| <768px (mobile) | Hamburger overlay | Stacked columns, snap scroll | Full-screen | Compact (hamburger + create) |
| 768-1023px (tablet) | Visible, icon-only (56px) | Horizontal scroll | Centered sheet | Full |
| ≥1024px (desktop) | Full sidebar (224px) | Horizontal scroll | Centered sheet | Full |

Board columns are `w-[85vw] sm:w-72` — full-width on mobile, fixed on desktop. Horizontal scroll snap (`snap-x snap-center`) for mobile column navigation.

## Environment Variables

- `VITE_API_BASE_URL` — backend API URL (default: `http://localhost:3344/api`)
- `GEMINI_API_KEY` — injected into `process.env.GEMINI_API_KEY` via Vite `define` (not used by current frontend code)

## Import Maps (⚠️ Unconventional)

`index.html` uses `<script type="importmap">` to resolve `react`, `react-dom`, and `recharts` from `esm.sh` CDN — even though they're installed in `node_modules` via bun. This means:

- **Browser resolves these from CDN at runtime**, bypassing node_modules entirely
- The CDN versions must match: `react@^19.2.3`, `recharts@^3.6.0`
- Other packages (`@dnd-kit/*`) are resolved normally through node_modules/Vite
- When adding new React ecosystem deps, check if they need importmap entries

## Naming Conventions

- **Components:** PascalCase (`TaskCard`, `BoardView`)
- **Props interfaces:** `{ComponentName}Props` (e.g., `TaskCardProps`)
- **Types/Enums:** PascalCase (`User`, `Status`)
- **Functions/handlers:** camelCase, prefixed with `handle` in App.tsx (`handleCreateTask`, `handleUpdateTask`)
- **Callback props:** `on` + action (`onTaskClick`, `onViewChange`)
- **Files match default export name** exactly

## Gotchas

### 1. No Tests
No test framework configured. No test files. No test scripts. Zero automated testing.

### 2. Optimistic Updates Without Rollback
Mutations update local state immediately, then call the API. If the API fails, the local state is NOT rolled back — only a toast warning appears. This means UI can get out of sync with reality if using a real backend.

### 3. Client-Side ID Generation
New tasks get `id: 't${Date.now()}'`, users get `id: 'u${Date.now()}'`. The backend may overwrite these. After `api.createTask()`, the returned task replaces the optimistic one by matching on this client-generated ID.

### 4. `useSortable` IDs Must Be Strings
If task IDs ever become numeric, they'll need `String()` conversion before being used with `SortableContext`.

### 5. Keyboard DnD Comes Free With @dnd-kit
Don't disable it. `KeyboardSensor` is included in `useSensors` array.

### 6. ESLint Rule: `any` is Allowed
`@typescript-eslint/no-explicit-any` is set to `"off"`. The API transform functions use `any` liberally.

### 7. ESLint Rule: `_` Prefix for Unused Vars
`@typescript-eslint/no-unused-vars` warns but ignores args starting with `_`.

### 8. `material-symbols-outlined` is Global CSS
The class is defined in `index.css` with specific font variation settings. All icon usage relies on this class being available. Do NOT remove it.

### 9. CDN Fonts
Inter and Material Symbols fonts load from Google Fonts CDN. No offline fallback — icons will be missing if offline.

### 10. Dark Mode Default
`<html class="dark">` is hardcoded in `index.html`. App defaults to dark theme on first load.

### 11. Vite Dev Server Binds to 0.0.0.0
Exposed on all network interfaces. Accessible from other devices on the local network.

### 12. `view-transition` Meta Tag
Enables crossfade between route changes in Chromium browsers. Gracefully degrades in Firefox/Safari.

### 13. `.prettierignore` Excludes `dist`, `node_modules`, `bun.lock`, `goals`
The `goals/` directory (containing implementation plan docs) is excluded from formatting.

### 14. Comments & Subtasks Have Complete API Integration
Both features are fully wired: create, read, update, delete endpoints exist in `api.ts` and handlers exist in `App.tsx`. The old comment stub that logged `"Comment API pending"` has been replaced.

### 15. Settings View Has Content Now
SettingsView is no longer a placeholder — it has General settings (project name, key, description) and Notifications toggles.

### 16. Prettier Config
- `printWidth: 100`, `tabWidth: 2`, `trailingComma: "all"`, `singleQuote: false`
- `prettier-plugin-tailwindcss` is enabled (auto-sorts Tailwind classes)
- Run `bun run format` before committing

## Common Development Tasks

### Adding a New API Endpoint
1. Add method to `api.ts` using `fromApi()`/`toApi()` for transformation
2. Add any new types to `types.ts`
3. Add handler in `App.tsx` (follow optimistic update pattern)
4. Thread handler through to the component that needs it

### Adding a New View
1. Create component in `components/pages/`
2. Add to `ViewMode` type union in `types.ts`
3. Add navigation item in `Sidebar.tsx` (`navItems` array)
4. Add route case in `AppLayout.renderContent()`
5. Add skeleton variant if view has async data

### Modifying Drag & Drop Behavior
- Sensor configuration lives in `BoardView.tsx` (`useSensors` call)
- Column drop handling in `handleDragEnd` (cross-column: `onTaskUpdate`, same-column: `onReorder`)
- Drag overlay styling in the `<DragOverlay>` section
- Touch delay (250ms) prevents accidental drags on scroll — adjust `TouchSensor` config if needed

### Working With Colors
- Always use semantic tokens from `tailwind.config.js` (e.g., `bg-jira-blue`, `text-text-primary`)
- Always provide dark variants (`dark:bg-dark-surface`, `dark:text-white`)
- Custom theme colors don't use Tailwind's opacity modifier syntax
