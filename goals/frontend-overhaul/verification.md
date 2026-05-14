# Verification: Jira-Faithful Frontend Overhaul

## Commands

| Command | Purpose | Expected pass condition | Evidence location |
| --- | --- | --- | --- |
| `bun run build` | TypeScript compilation + Vite production build | Exit code 0, dist/ produced, no TS errors | progress.jsonl |
| `bun run dev` | Start dev server | Server starts on port 3000 (or next available), no console errors | progress.jsonl |
| `bun run build 2>&1 \| wc -c` | Measure built JS size | dist/assets/*.js total under 200KB gzipped (run `gzip -c dist/assets/*.js \| wc -c`) | progress.jsonl |

## Manual Checks

### Phase 1 — Routing & Safety Net
- [ ] **URL routing:** Navigate to `localhost:3000/board`, `/list`, `/reports`, `/team`, `/settings` directly in the URL bar. Confirm each renders the correct view.
- [ ] **Task deep-link:** Navigate to `localhost:3000/board/task/PROJ-101`. Confirm the task detail modal opens over the board. The board should be visible behind the modal.
- [ ] **Back button:** From a task detail modal, press browser back. Confirm the modal closes and the underlying view remains. Press back again. Confirm you stay in the app (or navigate sensibly).
- [ ] **Create modal URL:** Navigate to `localhost:3000/board?create=true`. Confirm the create issue modal opens.
- [ ] **Error boundary:** Add a `throw new Error("test")` inside BoardView render. Confirm the error boundary catches it and shows fallback UI with a "Try again" button. Remove the throw afterward.
- [ ] **Loading skeletons:** On initial page load, confirm skeleton cards appear in board columns before real content paints (throttle to "Slow 3G" in DevTools to observe).
- [ ] **Toast notifications:** Create a task → confirm success toast at bottom-right. Disconnect network → try to update a task → confirm warning toast. Delete toast should have a different color.
- [ ] **Empty states:** Navigate to a sprint with zero tasks. Confirm columns show "No issues" empty state with appropriate illustration or text, not blank white space.

### Phase 2 — Visual Design
- [ ] **TaskCard visual:** Compare a TaskFlow card against a Jira Cloud board card screenshot. Check: key badge position, priority icon shape+color, type icon, label chips, avatar size+shape, due date placement.
- [ ] **Sidebar visual:** Compare against Jira's sidebar. Check: background color (blue), text color (white), active item highlight, project name, avatar at bottom.
- [ ] **Header visual:** Check breadcrumb-style navigation, sprint dropdown styling, create button prominence and color.
- [ ] **Board columns:** Check column header styling, issue count badge, card container background and border radius.
- [ ] **Dark mode:** Toggle dark mode. Confirm all components adapt with appropriate dark variants and no hardcoded white backgrounds break.

### Phase 3 — Drag-and-Drop
- [ ] **Mouse DnD:** Drag a card from TODO to IN PROGRESS. Confirm: card lifts with shadow, target column highlights, card lands in correct position, status updates.
- [ ] **Drop cancel:** Drag a card outside any column and release. Confirm card snaps back to original position.
- [ ] **Keyboard DnD:** Tab to a card, press Space to pick up, arrow keys to move to target column, Enter to drop. Confirm status updates.
- [ ] **Animation smoothness:** Open Performance tab in DevTools, record while dragging. Confirm consistent 60fps (no frames exceeding 16ms).
- [ ] **Touch DnD:** On mobile viewport, long-press a card, drag to another column, release. Confirm the flow works. (For manual testing, use Chrome DevTools device mode.)

### Phase 4 — Responsive
- [ ] **Desktop (1440px):** All views render correctly with full sidebar, full header, 3-column board.
- [ ] **Tablet (768px):** Sidebar collapses to icons only. Board columns fit the viewport. Modals are centered.
- [ ] **Mobile (375px):** Sidebar is hidden behind hamburger. Board columns stack vertically. Modals are full-screen with safe-area padding.
- [ ] **View transitions:** Switch between Board, List, Reports, Team, Settings at each breakpoint. Confirm no overflow, no collapsed text, no broken layouts.

### Phase 5 — Performance
- [ ] **Lighthouse audit:** Run Lighthouse (desktop, Chrome DevTools → Lighthouse tab → Performance). Target ≥90.
- [ ] **Interaction lag:** Click Create → modal opens immediately. Click a card → detail modal opens immediately. Drag a card → no visual delay between pointer and card.
- [ ] **Bundle size:** `dist/assets/*.js` total under 200KB gzipped. Run `gzip -c dist/assets/*.js | wc -c` and confirm.

### Regression
- [ ] **List view:** Switch to List view. Confirm tasks render in a table with correct columns.
- [ ] **Reports view:** Switch to Reports. Confirm burndown chart and pie chart render with data.
- [ ] **Team view:** Switch to Team. Confirm user cards render. Add member flow still works.
- [ ] **Settings view:** Switch to Settings. Confirm page renders.
- [ ] **Issue modal:** Click a task. Confirm detail modal opens with description, status, assignee, priority, subtasks, and comments sections all functional.
- [ ] **Create modal:** Click Create. Confirm form renders with all fields. Submit a task and see it appear on the board.
- [ ] **Dark/light toggle:** Toggle the theme 3 times. Confirm no flicker, no stuck styles.

## Evidence Rules

- Record verification results in `progress.jsonl`.
- Each entry: `{"timestamp": "...", "phase": "1-5", "check": "...", "status": "pass|fail|blocked", "artifact": "path or URL if applicable"}`
- Screenshots save to `goals/frontend-overhaul/evidence/`.
- Screen recordings save to the same directory.
- Do not mark a phase complete until all its checks pass.
