# Backend API & Frontend Integration Plan for TaskFlow

## Context

TaskFlow is a Jira-like project management dashboard. The frontend (React 19 + TypeScript) currently has an API layer (`api.ts`) defining 14 functions that call a backend at `http://localhost:3344/api`. The UI has action buttons, forms, and drag-and-drop wired to these API functions with optimistic update patterns. This plan documents every endpoint the backend must implement, their full contracts, and which frontend components trigger them.

---

## 1. Type System (shared contract)

All JSON uses **snake_case** on the wire. The frontend transforms to camelCase internally.

### Enums

| Enum | Wire Values |
|---|---|
| `Priority` | `"Low"`, `"Medium"`, `"High"`, `"Critical"` |
| `Status` | `"To Do"`, `"In Progress"`, `"Review"`, `"Done"` |
| `IssueType` | `"Task"`, `"Bug"` |
| `SprintStatus` | `"active"`, `"future"`, `"closed"` |

### Core Entities

**User**
| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | Yes | Primary key |
| `name` | string | Yes | |
| `avatar` | string | Yes | URL |
| `email` | string | Yes | Unique |
| `role` | string | No | |

**Sprint**
| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | Yes | Primary key |
| `name` | string | Yes | |
| `start_date` | string | Yes | ISO date |
| `end_date` | string | Yes | ISO date |
| `goal` | string | Yes | |
| `status` | `"active"` \| `"future"` \| `"closed"` | Yes | |

**Task**
| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | Yes | Primary key |
| `key` | string | Yes | e.g. `"PROJ-101"`, auto-generated |
| `title` | string | Yes | |
| `description` | string | Yes | Markdown |
| `status` | `"To Do"` \| `"In Progress"` \| `"Review"` \| `"Done"` | Yes | |
| `priority` | `"Low"` \| `"Medium"` \| `"High"` \| `"Critical"` | Yes | |
| `type` | `"Task"` \| `"Bug"` | Yes | |
| `assignee_id` | string \| null | No | FK to User |
| `reporter_id` | string | Yes | FK to User |
| `sprint_id` | string | Yes | FK to Sprint |
| `due_date` | string \| null | No | ISO date |
| `created_at` | string | Yes | ISO datetime |
| `updated_at` | string | Yes | ISO datetime |
| `order` | number | No | Sort order within a status column |
| `labels` | string[] | Yes | |
| `comments` | Comment[] | No | Embedded when returned with task |
| `subtasks` | Subtask[] | No | Embedded when returned with task |
| `attachments` | Attachment[] | No | |

**Comment**
| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | Yes | Primary key |
| `user_id` | string | Yes | FK to User |
| `text` | string | Yes | |
| `created_at` | string | Yes | ISO datetime |

**Subtask**
| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | Yes | Primary key |
| `task_id` | string | Yes | FK to Task |
| `title` | string | Yes | |
| `completed` | boolean | Yes | |
| `created_at` | string | No | |
| `updated_at` | string | No | |

**Attachment** (inline on Task)
| Field | Type | Notes |
|---|---|---|
| `name` | string | |
| `size` | string | |
| `type` | `"pdf"` \| `"image"` \| `"other"` | |

---

## 2. REST API Endpoints

Base URL: `/api`

### 2.1 Users

#### `GET /api/users` — List all users

- **Query params:** none
- **Response:** `200` — `User[]`
- **Frontend call site:** App mount (`useEffect` initial load)
- **Rules:** Return all users sorted by name.

#### `POST /api/users` — Create a user

- **Request body:**
  ```json
  { "name": "string (required)", "email": "string (required)", "role": "string (optional)" }
  ```
- **Response:** `201` — `User` (with generated `id` and `avatar`)
- **Frontend call site:** `AddMemberModal` → "Add Member" submit button → `handleAddMember`
- **Rules:**
  - Generate `id` (UUID or similar).
  - Generate `avatar` URL from email (e.g., Gravatar or UI-avatars.com style: `https://ui-avatars.com/api/?name={name}&background=random`).
  - Return 400 if `name` or `email` is missing.
  - Return 409 if `email` already exists.

#### `GET /api/users/:id` — Get single user **(missing — needed)**

- **Response:** `200` — `User` | `404`
- **Need:** Currently no frontend consumer, but REST completeness.

#### `PUT /api/users/:id` — Update a user **(missing — needed)**

- **Request body:** `Partial<User>`
- **Response:** `200` — `User`
- **Need:** Editing user profile/role from TeamView or SettingsView.

#### `DELETE /api/users/:id` — Delete a user **(missing — needed)**

- **Response:** `204` — No content | `404`
- **Rules:** Reassign or unassign tasks owned by this user (set `assignee_id` to null). Return 409 if user is `reporter_id` on any task (tasks must be deleted or reassigned first).

---

### 2.2 Sprints

#### `GET /api/sprints` — List all sprints

- **Query params:** none
- **Response:** `200` — `Sprint[]`
- **Frontend call site:** App mount
- **Rules:** Return all sprints. Sort by `start_date` descending (newest first).

#### `POST /api/sprints` — Create a sprint

- **Request body:**
  ```json
  {
    "name": "string (required)",
    "goal": "string (optional)",
    "start_date": "string (optional, ISO date)",
    "end_date": "string (optional, ISO date)"
  }
  ```
- **Response:** `201` — `Sprint` (status defaults to `"future"`)
- **Frontend call site:** `NewSprintDialog` → "Create Sprint" button → `handleCreateSprint`
- **Rules:**
  - Default `status` to `"future"`.
  - Generate `id`.
  - Return 400 if `name` is missing.
  - `end_date` must be after `start_date` if both are provided.

#### `PUT /api/sprints/:id` — Update a sprint

- **Request body:** `Partial<Sprint>`
- **Response:** `200` — `Sprint`
- **Frontend call sites:**
  - `BoardView` → "Start Sprint" button → `handleStartSprint` sends `{ "status": "active" }`
  - `BoardView` → "Complete Sprint" button → `handleCompleteSprint` sends `{ "status": "closed" }`
- **Rules:**
  - `status` transitions: `future → active → closed`. Only these transitions are valid.
  - Starting a sprint: if another sprint is `"active"`, either auto-close it or return 409.
  - Closing a sprint: move all incomplete tasks to the next active/future sprint, or return 409 with a list of incomplete tasks.
  - Return 400 for invalid status transitions.

#### `GET /api/sprints/:id` — Get single sprint **(missing)**

- **Response:** `200` — `Sprint` | `404`

#### `DELETE /api/sprints/:id` — Delete a sprint **(missing)**

- **Response:** `204` | `404` | `409`
- **Rules:** Return 409 if sprint has tasks. Tasks must be moved to another sprint first.

---

### 2.3 Tasks

#### `GET /api/tasks` — List all tasks

- **Query params (recommended):**
  - `sprint_id` — filter by sprint
  - `assignee_id` — filter by assignee
  - `search` — full-text search on `title` and `key`
  - `status` — filter by status
- **Response:** `200` — `Task[]` (each task includes embedded `comments`, `subtasks`, `attachments` arrays)
- **Frontend call site:** App mount
- **Note:** Currently all filtering is client-side. Server-side filtering is recommended for scale but not required for MVP.

#### `POST /api/tasks` — Create a task

- **Request body:**
  ```json
  {
    "title": "string (required)",
    "description": "string (optional, defaults to \"\")",
    "type": "\"Task\" | \"Bug\" (required)",
    "priority": "\"Low\" | \"Medium\" | \"High\" | \"Critical\" (required)",
    "assignee_id": "string | null (optional)",
    "sprint_id": "string (required)",
    "reporter_id": "string (required)",
    "status": "\"To Do\" (default)",
    "labels": "string[] (default: [])"
  }
  ```
- **Response:** `201` — `Task` (with generated `id`, `key`, `created_at`, `updated_at`)
- **Frontend call site:** `CreateIssueModal` → "Create Issue" submit → `handleCreateTask`
- **Rules:**
  - Generate `id` (UUID).
  - Auto-generate `key` in format `PROJ-{incrementing_number}` (e.g., `PROJ-101`).
  - Default `status` to `"To Do"`.
  - Default `order` to the next available order number in that status column.
  - Set `created_at` and `updated_at` to now.
  - Return 400 if required fields are missing.
  - Validate that `sprint_id` and `reporter_id` reference existing entities.

#### `GET /api/tasks/:id` — Get single task **(missing — needed)**

- **Response:** `200` — `Task` (with embedded comments, subtasks, attachments) | `404`

#### `PUT /api/tasks/:id` — Update a task

- **Request body:** `Partial<Task>` — only the fields to update
- **Response:** `200` — `Task` (full updated object)
- **Frontend call sites (many):**
  - `IssueModal` title inline edit → sends `{ "title": "..." }`
  - `IssueModal` type picker → sends `{ "type": "Task" | "Bug" }`
  - `IssueModal` status step buttons → sends `{ "status": "..." }`
  - `IssueModal` description save → sends `{ "description": "..." }`
  - `IssueModal` label add/remove → sends `{ "labels": [...] }`
  - `IssueModal` assignee select → sends `{ "assignee_id": "..." }`
  - `IssueModal` priority select → sends `{ "priority": "..." }`
  - `IssueModal` due date picker → sends `{ "due_date": "..." }`
  - `BoardView` cross-column drag-and-drop → sends `{ "status": "...", "order": N }`
- **Rules:**
  - Auto-update `updated_at` on every write.
  - All fields are optional in the request body — only update what's sent.
  - Validate foreign keys if `assignee_id`, `sprint_id`, or `reporter_id` are changed.
  - When `status` changes, recalculate `order` for the old and new status columns (or let the client send the exact `order` value).
  - Title field is also updated on every keystroke from the frontend — consider debouncing on the backend side if needed, but just accept the writes for simplicity.

#### `DELETE /api/tasks/:id` — Delete a task

- **Response:** `204` — No content | `404`
- **Frontend call site:** Currently NOT wired to any UI element. The `deleteTask` function exists in `api.ts` but no button calls it. **Need:** Add a delete button to `IssueModal` (e.g., in the "more options" `...` menu).
- **Rules:**
  - Cascade delete: remove all associated comments and subtasks.
  - Return 204 on success.

#### `PUT /api/tasks/reorder` — Bulk reorder tasks within a status column **(missing — needed)**

- **Request body:**
  ```json
  {
    "status": "\"To Do\" | \"In Progress\" | \"Review\" | \"Done\"",
    "task_ids": ["id1", "id2", "id3", ...]
  }
  ```
- **Response:** `200` — `{ "ok": true }`
- **Frontend call site:** `BoardView` same-column drag-and-drop → `handleReorder` (currently local-only, needs to call this)
- **Rules:**
  - The order of `task_ids` in the array determines the new `order` values (first = 0, second = 1, etc.).
  - Only update tasks that belong to the given `status`.
  - This replaces individual `PUT /api/tasks/:id` calls for every reordered card, which would be chatty.

---

### 2.4 Comments

#### `GET /api/tasks/:task_id/comments` — List comments for a task

- **Response:** `200` — `Comment[]`
- **Frontend call site:** Currently comments come embedded in the `Task` object from `GET /api/tasks`. This endpoint exists in `api.ts` but is NOT called anywhere in the current UI. **Potential use:** pagination or lazy-loading comments.

#### `POST /api/tasks/:task_id/comments` — Add a comment

- **Request body:**
  ```json
  { "user_id": "string (required)", "text": "string (required)" }
  ```
- **Response:** `201` — `Comment`
- **Frontend call site:** `IssueModal` comment textarea → Save button → `handleAddComment`
- **Rules:**
  - Generate `id` and `created_at`.
  - Validate `user_id` references an existing user.
  - Return 400 if `text` is empty.

#### `PUT /api/comments/:id` — Update a comment **(exists in api.ts, not wired in UI)**

- **Request body:** `{ "text": "string" }`
- **Response:** `200` — `Comment`
- **Need:** Add edit button to comments in `IssueModal`.

#### `DELETE /api/comments/:id` — Delete a comment **(exists in api.ts, not wired in UI)**

- **Response:** `204` | `404`
- **Need:** Add delete button to comments in `IssueModal`.

---

### 2.5 Subtasks

#### `GET /api/tasks/:task_id/subtasks` — List subtasks for a task

- **Response:** `200` — `Subtask[]`
- **Note:** Like comments, subtasks come embedded in `Task`. This endpoint exists in `api.ts` but is not called separately.

#### `POST /api/tasks/:task_id/subtasks` — Create a subtask

- **Request body:**
  ```json
  { "title": "string (required)" }
  ```
- **Response:** `201` — `Subtask` (with `completed: false`, generated `id`, `created_at`)
- **Frontend call site:** `IssueModal` subtask input → Enter/check button → `handleAddSubtask`
- **Rules:**
  - Default `completed` to `false`.
  - Return 400 if `title` is empty.

#### `PUT /api/subtasks/:id` — Update a subtask

- **Request body:** `Partial<Subtask>` (typically just `{ "completed": true/false }` or `{ "title": "..." }`)
- **Response:** `200` — `Subtask`
- **Frontend call site:** `IssueModal` subtask checkbox toggle → `handleToggleSubtask` sends `{ "completed": bool }`
- **Rules:** Auto-update `updated_at`.

#### `DELETE /api/subtasks/:id` — Delete a subtask

- **Response:** `204` | `404`
- **Frontend call site:** `IssueModal` subtask trash icon → `handleDeleteSubtask`

---

## 3. Frontend Action Map

Every UI action → handler → API call, organized by component.

### 3.1 App.tsx (initial load)

| Trigger | Handler | API Call |
|---|---|---|
| App mount `useEffect` | inline | `GET /api/users`, `GET /api/tasks`, `GET /api/sprints` (parallel) |

### 3.2 Header

| UI Element | Handler Prop | API Call |
|---|---|---|
| Sprint `<select>` change | `onSprintChange` → `setCurrentSprintId` | None (client-side filter) |
| Search `<input>` type | `onSearch` → `setSearchQuery` | None (client-side filter) |
| Create button (blue) | `onCreateClick` → `openCreateModal` | None (opens CreateIssueModal via URL) |
| New sprint `+` button → opens `NewSprintDialog` | `onCreateSprint` → `handleCreateSprint` | `POST /api/sprints` |

### 3.3 Sidebar

No API calls. Pure routing and theme toggle.

### 3.4 BoardView

| UI Element | Handler Prop | API Call |
|---|---|---|
| Task card click | `onTaskClick` → `handleTaskClick` | None (URL navigation to task detail) |
| Cross-column drag-and-drop | `onTaskUpdate` → `handleUpdateTask` | `PUT /api/tasks/:id` (status + order) |
| Same-column drag-and-drop | `onReorder` → `handleReorder` | **None currently** — should call `PUT /api/tasks/reorder` |
| Start Sprint button | `onStartSprint` → `handleStartSprint` | `PUT /api/sprints/:id` (`{ "status": "active" }`) |
| Complete Sprint button | `onCompleteSprint` → `handleCompleteSprint` | `PUT /api/sprints/:id` (`{ "status": "closed" }`) |
| Assignee filter avatars | `onFilterAssignee` → `setFilterAssigneeId` | None (client-side) |
| "Mine" filter toggle | `onToggleMyTasks` → `setShowMyTasksOnly` | None (client-side) |

### 3.5 ListView

| UI Element | Handler Prop | API Call |
|---|---|---|
| Task row click | `onTaskClick` → `handleTaskClick` | None (URL navigation) |
| Create issue button (footer) | `onCreateClick` → `openCreateModal` | None (opens CreateIssueModal) |
| Assignee/Mine filters | same as BoardView | None |

### 3.6 IssueModal (task detail)

| UI Element | Handler Prop | API Call |
|---|---|---|
| Title inline edit (keystrokes) | `onUpdateTask` → `handleUpdateTask` | `PUT /api/tasks/:id` |
| Type picker (Task/Bug) | `onUpdateTask` → `handleUpdateTask` | `PUT /api/tasks/:id` |
| Status step buttons (4 columns) | `onUpdateTask` → `handleUpdateTask` | `PUT /api/tasks/:id` |
| Description Save button | `onUpdateTask` → `handleUpdateTask` | `PUT /api/tasks/:id` |
| Label add (Enter) | `onUpdateTask` → `handleUpdateTask` | `PUT /api/tasks/:id` |
| Label remove (X) | `onUpdateTask` → `handleUpdateTask` | `PUT /api/tasks/:id` |
| Assignee `<select>` | `onUpdateTask` → `handleUpdateTask` | `PUT /api/tasks/:id` |
| Priority `<select>` | `onUpdateTask` → `handleUpdateTask` | `PUT /api/tasks/:id` |
| Due date `<input>` | `onUpdateTask` → `handleUpdateTask` | `PUT /api/tasks/:id` |
| Comment Save button | `onAddComment` → `handleAddComment` | `POST /api/tasks/:id/comments` |
| Subtask input Enter/check | `onAddSubtask` → `handleAddSubtask` | `POST /api/tasks/:id/subtasks` |
| Subtask checkbox toggle | `onToggleSubtask` → `handleToggleSubtask` | `PUT /api/subtasks/:id` |
| Subtask delete (trash) | `onDeleteSubtask` → `handleDeleteSubtask` | `DELETE /api/subtasks/:id` |

### 3.7 CreateIssueModal

| UI Element | Handler Prop | API Call |
|---|---|---|
| Create Issue submit button | `onCreate` → `handleCreateTask` | `POST /api/tasks` |

### 3.8 AddMemberModal

| UI Element | Handler Prop | API Call |
|---|---|---|
| Add Member submit button | `onAdd` → `handleAddMember` | `POST /api/users` |

### 3.9 NewSprintDialog

| UI Element | Handler Prop | API Call |
|---|---|---|
| Create Sprint button | `onCreate` → `handleCreateSprint` | `POST /api/sprints` |

### 3.10 TeamView

| UI Element | Handler Prop | API Call |
|---|---|---|
| Add Member button | `onAddMemberClick` → `setIsAddMemberModalOpen(true)` | None (opens modal) |

### 3.11 ReportsView, SettingsView, TaskCard

No API calls. Display-only or local-only.

---

## 4. Frontend Gaps — Missing UI Wiring

These API functions exist in `api.ts` but have no UI to trigger them:

| API Function | Endpoint | What Needs a Button |
|---|---|---|
| `api.deleteTask(id)` | `DELETE /api/tasks/:id` | Add delete option to IssueModal "..." menu |
| `api.updateComment(id, updates)` | `PUT /api/comments/:id` | Add edit button on each comment |
| `api.deleteComment(id)` | `DELETE /api/comments/:id` | Add delete button on each comment |
| `api.fetchComments(taskId)` | `GET /api/tasks/:id/comments` | Not needed if comments come embedded in Task |
| `api.fetchSubtasks(taskId)` | `GET /api/tasks/:id/subtasks` | Not needed if subtasks come embedded in Task |
| `handleReorder` | `PUT /api/tasks/reorder` | BoardView same-column drag currently only updates local state |

---

## 5. Backend Implementation Order (Recommended)

### Phase 1 — Core CRUD (MVP)
1. `GET /api/users` + `POST /api/users`
2. `GET /api/sprints` + `POST /api/sprints` + `PUT /api/sprints/:id`
3. `GET /api/tasks` + `POST /api/tasks` + `PUT /api/tasks/:id` + `DELETE /api/tasks/:id`
4. `POST /api/tasks/:id/comments`
5. `POST /api/tasks/:id/subtasks` + `PUT /api/subtasks/:id` + `DELETE /api/subtasks/:id`

### Phase 2 — Completeness
6. `PUT /api/tasks/reorder` (bulk reorder)
7. `GET /api/users/:id` + `PUT /api/users/:id` + `DELETE /api/users/:id`
8. `GET /api/sprints/:id` + `DELETE /api/sprints/:id`
9. `PUT /api/comments/:id` + `DELETE /api/comments/:id`
10. Server-side filtering on `GET /api/tasks` (query params)

### Phase 3 — Polish
11. `GET /api/tasks/:id` (single task with all relations)
12. Attachment upload endpoint
13. Authentication/authorization layer
14. WebSocket or SSE for real-time updates

---

## 6. Key Design Decisions for Backend

1. **ID generation:** Server generates all IDs. The frontend's optimistic temp IDs (`t{Date.now()}`) are replaced when the server response arrives.

2. **Snake case on the wire:** All JSON keys are snake_case. The frontend `api.ts` handles conversion transparently.

3. **Embedded vs separate resources:** Currently Tasks embed `comments[]`, `subtasks[]`, and `attachments[]`. The separate endpoints (`GET /api/tasks/:id/comments`) exist but are unused. Backend can either:
   - Always embed them in Task responses (simpler, current frontend expectation)
   - Not embed them and require separate fetches (cleaner REST, needs frontend changes)

4. **Optimistic updates:** The frontend updates local state BEFORE the API call. The backend should return the authoritative object in create/update responses so the frontend can reconcile. The frontend currently does NOT roll back on API failure — the backend should be the source of truth.

5. **Title keystroke updates:** The IssueModal fires `PUT /api/tasks/:id` on every keystroke in the title field. Consider a short debounce (300ms) on the frontend or ensure the backend can handle rapid-fire updates gracefully.

---

## 7. Verification

### Backend Verification
- Start backend on `http://localhost:3344/api`
- Run `bun run dev` and verify the app loads without falling back to mock data (check browser console — no "fetch failed, using mock data" log)
- Create a task via the UI → verify it appears in board view → refresh → still there
- Update task status via drag-and-drop → refresh → status persisted
- Create a sprint → start it → complete it → verify status transitions
- Add a comment → verify it appears
- Add a subtask → toggle it → delete it → verify

### Frontend Verification (after wiring gaps)
- Delete a task from IssueModal → verify it disappears from board
- Edit/delete a comment → verify changes persist
- Same-column drag reorder → verify order persists on refresh (requires `PUT /api/tasks/reorder`)
