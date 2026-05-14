# Plan: Jira-Faithful Frontend Overhaul

## Solution Overview

TaskFlow currently works but feels like a starter template. We're going to upgrade it in five layered phases, each building on the last, so the app crosses the finish line as a credible Jira alternative — not just in features, but in feel.

The core insight: we're not adding features. We're making existing features feel so good that users forget they're using a web app. This means every interaction — drag, click, load, error — has a deliberate, Jira-modeled response.

## Why This Approach

Five sequential phases, not parallel streams. Each phase produces a visible, testable improvement. If we need to stop after phase 3, we still shipped a better app than we started with.

Phase order matters:
- **Routing & safety first** (react-router, error boundaries, skeletons, toasts) — foundational architecture: URLs for deep-linking, proper UX fallbacks for every component.
- **Visuals second** (design tokens, component restyle, Tailwind build pipeline) — so drag-and-drop is implemented against the final visual language, not the old one.
- **Interaction third** (drag-and-drop) — the highest-value feature, now built on solid visuals.
- **Responsive fourth** — adapts the now-polished desktop experience to smaller screens.
- **Performance fifth** — the final optimization pass, easiest to tune once visuals and interactions are stable.

## How It Will Work

### Phase 1: Routing & Safety Net
Install `react-router-dom` v7 (~6KB gzipped) and add three infrastructure components:

**Routing:**
- Replace `currentView` state with URL-based routes. Install `react-router-dom`.
- Route structure:
  - `/` → redirect to `/board`
  - `/board`, `/list`, `/reports`, `/team`, `/settings` → main views
  - `/board/task/:taskKey` → IssueModal as a nested route over the board (board stays mounted underneath)
  - `/list/task/:taskKey` → same nested pattern for list view
  - `?create=true` → query param opens CreateIssueModal
- `App.tsx` wraps in `<BrowserRouter>`. The router-aware layout component reads `useLocation` to determine active view. `selectedTask` and `isCreateModalOpen` move from state to URL-derived values.

**Safety net:**
- **ErrorBoundary** — wraps each page view, catches render errors, shows a Jira-style error state with a "try again" action.
- **Skeleton system** — `SkeletonCard`, `SkeletonColumn` components that match the dimensions of their real counterparts. Board view shows skeleton columns while data loads.
- **Toast notifications** — a `ToastProvider` + `useToast` hook. Mutation successes and failures surface as timed toast messages in the bottom-right corner, Jira-style.

No existing functionality changes beyond the routing refactor; we enhance with fallbacks after routing works.

### Phase 2: Jira-Faithful Visual Design
Jira's design language is distinctive: high-density cards with key badges, colored priority icons, label chips, circular avatars, and a blue sidebar navigation. We match it:

- **Design tokens** — migrate from Tailwind CDN to build-time Tailwind with a `tailwind.config` that defines Jira-matching colors (`jira-blue: #0052CC`, `jira-green: #36B37E`, `jira-red: #FF5630`, `jira-yellow: #FFAB00`), spacing scale, and font sizes.
- **TaskCard redesign** — issue key badge (e.g., "PROJ-101"), priority icon (colored arrow per Jira convention), issue type icon, label chips with color, circular assignee avatar. Card background white with a subtle left-border accent on hover.
- **Sidebar redesign** — blue background (#0747A6), white text, project name at top, navigation items with Material Symbol icons, collapse toggle, user avatar at bottom.
- **Header redesign** — breadcrumb-style nav (Project / Board → dropdown), prominent blue "Create" button, sprint selector styled as a Jira dropdown.
- **Board columns** — Jira-style column headers with issue count badges, rounded card containers with subtle grey background.

### Phase 3: Drag-and-Drop Kanban
Install `@dnd-kit/core` + `@dnd-kit/sortable` (combined ~7KB gzipped). Build a DnD system on top of the now-styled BoardView:

- Each column is a `useDroppable` drop zone.
- Each `TaskCard` is a `useDraggable` item.
- On drag start: card lifts with a drop shadow, source column dims slightly.
- On drag over: target column highlights with a colored border, insertion indicator appears between cards.
- On drop: optimistic status update fires immediately (card moves in UI), API call follows.
- On drag cancel: card snaps back to original position with a spring animation.
- Keyboard support: cards are focusable and can be moved with keyboard (Space to grab, arrows to move, Enter to drop) — this comes free with @dnd-kit's accessibility layer.

Drag state is managed in BoardView with a `DragOverlay` for the floating card, avoiding the need to lift DnD state to App.tsx. Status changes flow through the existing `onTaskUpdate` callback.

### Phase 4: Responsive Design
Make every view work from 320px to 2560px:

- **Sidebar** — on screens below 768px, sidebar collapses to a hamburger-triggered overlay. On 768-1024px, collapses to icon-only mode. Above 1024px, full sidebar with text.
- **Board** — on mobile, columns stack vertically with horizontal scroll snap. Column widths adjust to fill the viewport.
- **Task cards** — touch-friendly drag handle (long-press to initiate DnD on mobile), minimum 44px touch targets.
- **Modals** — full-screen on mobile, centered sheet on desktop.
- **Header** — compact on mobile (just hamburger + sprint name + create button).

### Phase 5: Performance & Micro-Interactions
The "feel" layer:

- **Memoization** — `React.memo` on TaskCard, StatusBadge, Avatar, Sidebar (these re-render most). `useMemo` on filtered/sorted task lists. `useCallback` on handlers passed as props.
- **Preloading** — all data already loads once in App.tsx (the 8 mock tasks), so views render instantly. No lazy-loading needed for this dataset size.
- **Micro-interactions** — card hover lift (2px translateY + shadow), button press scale (0.97), column highlight pulse on task drop, sidebar item active indicator slide, create button 200ms rotate on modal open.
- **Transitions** — view switches get a 200ms crossfade via CSS `view-transition-api` (Chrome) with a no-op fallback for other browsers.
- **Layout stability** — skeleton dimensions match real content exactly, preventing Cumulative Layout Shift.

## Slices

| Slice | Purpose | Main files | Done when | Risks |
| --- | --- | --- | --- | --- |
| 1. Routing & safety | react-router, URL-based views, error boundaries, skeletons, toast system | `App.tsx`, `ErrorBoundary.tsx`, `Skeleton.tsx`, `Toast.tsx`, `package.json` (react-router-dom) | Deep-link URLs work for all views and task details, skeletons show on load, toasts on mutation, errors caught | Medium — routing refactor touches App.tsx state management, but all existing behavior preserved |
| 2. Visual redesign | Jira-faithful design tokens and component restyle | `tailwind.config.js`, `index.html` (remove CDN), `TaskCard.tsx`, `Sidebar.tsx`, `Header.tsx`, `BoardView.tsx` | App visually matches Jira's density, colors, and component style at 1440px viewport | Medium — removing CDN for build-time Tailwind requires PostCSS setup; visual regressions possible |
| 3. Drag-and-drop | Kanban column DnD with @dnd-kit | `BoardView.tsx`, `TaskCard.tsx`, `package.json` (new deps) | Tasks drag between columns, status updates, keyboard accessible | Low — @dnd-kit is mature; main risk is integration with existing state pattern |
| 4. Responsive | Mobile/tablet/desktop adaptive layout | `Sidebar.tsx`, `BoardView.tsx`, `Header.tsx`, `IssueModal.tsx` | App is usable and visually correct at 375px, 768px, 1024px, 1440px widths | Medium — modals and board layout need rethinking at small sizes; touch DnD needs long-press |
| 5. Performance | Memoization, transitions, micro-interactions | All component files, `App.tsx` | Lighthouse perf score ≥90, interactions feel instant, no jank during DnD | Low — tuning pass; main risk is over-memoizing and causing stale closure bugs |

## Sequencing

Slices run in order (1→2→3→4→5). Each depends on the previous:

- Phase 2 depends on Phase 1 because visual changes need routing stable and error boundaries in place.
- Phase 3 depends on Phase 2 because DnD should be built against the final card/column design.
- Phase 4 depends on Phase 3 because responsive board behavior depends on DnD interaction model.
- Phase 5 depends on Phase 4 because memoization is safest after UI structure is stable.

## Phase Boundaries

Stop and create a new goal if:
- The scope expands beyond these 5 phases (e.g., "add a Gantt chart view").
- A backend becomes available and needs integration (that's a separate goal).
- Performance bottlenecks are found in the React render cycle that require architectural changes (state library, virtual scrolling).

## Steering Notes

- **Jira references:** During Phase 2, compare against screenshots of Jira Cloud's board view. If a design choice isn't clearly Jira-modeled, default to Jira's actual behavior.
- **Accessibility:** @dnd-kit provides keyboard DnD for free. Don't disable it. Ensure color contrast meets WCAG AA during the visual redesign.
- **Bundle vigilance:** After adding @dnd-kit and migrating Tailwind, run `bun run build` and check the dist size. If it exceeds 200KB gzipped, flag it before proceeding to Phase 5.
- **User review gates:** After each phase, the user should visually inspect the app before proceeding. Don't stack un-reviewed phases.

## Acceptance Criteria

- [ ] Navigating to `/board`, `/list`, `/reports`, `/team`, `/settings` renders the correct view.
- [ ] Navigating to `/board/task/PROJ-101` opens the task detail modal over the board.
- [ ] Browser back button closes task detail modal and returns to the underlying view.
- [ ] Navigating to `/board?create=true` opens the create issue modal.
- [ ] Error boundary catches a deliberate render error and shows fallback UI instead of a white screen.
- [ ] Loading skeletons appear on initial load and match the final content layout (no layout shift).
- [ ] Toast notifications appear on task create, update, and delete (success and failure paths).
- [ ] TaskCard matches Jira's visual style: key badge, priority icon, type icon, labels, avatar, due date.
- [ ] Sidebar matches Jira's blue navigation with active item indicator.
- [ ] Tasks drag smoothly between Board columns at 60fps with visible drop indicators.
- [ ] Keyboard users can move tasks between columns without a mouse.
- [ ] Board layout is usable at 375px viewport width (stacked columns with horizontal scroll or wrap).
- [ ] Sidebar collapses to icon-only at medium widths and overlay on mobile.
- [ ] Modals are full-screen on mobile, centered sheets on desktop.
- [ ] Lighthouse Performance score ≥90 on desktop.
- [ ] No visible lag on interactions (drag, click, modal open/close).
- [ ] `bun run build` succeeds with no TypeScript errors.
- [ ] All 5 existing views (Board, List, Reports, Team, Settings) render without regressions.

## Required Evidence

| Requirement | Evidence to inspect | Where evidence is recorded |
| --- | --- | --- |
| Routing and deep-linking | URL bar screenshots showing `/board/task/PROJ-101`, `/list`, etc. | progress.jsonl |
| Error boundary works | Screenshot of error state after forced crash | progress.jsonl |
| Skeleton loading UX | Screenshot or screen recording of initial load | progress.jsonl |
| Toast notifications | Screenshot of toast after create/update actions | progress.jsonl |
| Jira-faithful visuals | Side-by-side comparison screenshot (Jira vs TaskFlow) | progress.jsonl |
| Drag-and-drop functioning | Screen recording of DnD between columns | progress.jsonl |
| Keyboard DnD | Screen recording of keyboard-driven card move | progress.jsonl |
| Responsive layout | Screenshots at 375/768/1024/1440px widths | progress.jsonl |
| Lighthouse score | Lighthouse report JSON or screenshot | progress.jsonl |
| Build succeeds | Terminal output of `bun run build` | progress.jsonl |
| View regression check | Screenshots of all 5 views | progress.jsonl |

## Completion Audit

Before marking the goal complete, verify every acceptance checkbox has real evidence in `progress.jsonl`. If any item lacks evidence, the goal is not done.
