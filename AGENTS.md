# AGENTS.md - TaskFlow Jira Frontend

## Overview

This is a **React + TypeScript + Vite** project that implements a modern project management dashboard (Jira-like interface) called **TaskFlow**. The application features dark mode, drag-and-drop Kanban board, task management, team management, and reporting capabilities.

**Key Technologies:**
- React 19.2.3 with TypeScript
- Vite 6.2.0 (build tool)
- Tailwind CSS (via CDN) for styling
- Recharts for data visualization
- No state management library (uses React hooks)

## Essential Commands

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

**Required Environment Variables:**
- `VITE_API_BASE_URL` - Backend API endpoint (default: `http://localhost:3344/api`)
- `GEMINI_API_KEY` - Required for AI Studio integration (mentioned in README)

**Configuration Files:**
- `.env` - Environment variables (currently sets API base URL)
- `vite.config.ts` - Vite configuration with path aliases and env injection
- `tsconfig.json` - TypeScript configuration

## Project Structure

```
D:/vibecoding/Tandingan-Jira---Frontend/
├── App.tsx                    # Main application component
├── index.tsx                  # React entry point
├── index.html                 # HTML template with Tailwind CDN
├── api.ts                     # API layer with snake_case ↔ camelCase transformation
├── types.ts                   # TypeScript type definitions
├── constants.ts               # Mock data (users, sprints, tasks)
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
└── components/
    ├── organisms/             # Complex components (modals, sidebar, header)
    ├── molecules/             # Medium components (TaskCard)
    ├── atoms/                 # Simple components (Avatar, StatusBadge, PriorityIcon)
    ├── pages/                 # View components (BoardView, ListView, etc.)
    └── [duplicate files]      # Note: Some components exist in both root and subdirectories
```

## Code Organization & Patterns

### Component Architecture

**Atomic Design Structure:**
- **Atoms**: Simple, reusable UI components (Avatar, StatusBadge, PriorityIcon)
- **Molecules**: Composed atoms (TaskCard)
- **Organisms**: Complex components (Sidebar, Header, Modals)
- **Pages**: Full view components (BoardView, ListView, TeamView, ReportsView, SettingsView)

**Note**: There are duplicate component files in both `components/` root and subdirectories. The codebase appears to use the `components/organisms/`, `components/molecules/`, and `components/atoms/` structure.

### Naming Conventions

- **Components**: PascalCase (e.g., `TaskCard`, `BoardView`)
- **Props**: PascalCase interface names (e.g., `TaskCardProps`, `BoardViewProps`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `Task`, `ViewMode`)
- **Enum Values**: UPPER_SNAKE_CASE (e.g., `Priority.HIGH`, `Status.TODO`)
- **Functions**: camelCase (e.g., `handleCreateTask`, `fetchUsers`)

### Type System

**Key Types** (`types.ts`):
```typescript
// Enums for fixed values
enum Priority { LOW = 'Low', MEDIUM = 'Medium', HIGH = 'High', CRITICAL = 'Critical' }
enum Status { TODO = 'To Do', IN_PROGRESS = 'In Progress', REVIEW = 'Review', DONE = 'Done' }
enum IssueType { TASK = 'Task', BUG = 'Bug' }

// Core interfaces
interface User { id: string; name: string; avatar: string; email: string; role?: string; }
interface Task { 
  id: string; 
  key: string; // e.g., PROJ-101
  title: string;
  status: Status;
  priority: Priority;
  type: IssueType;
  // ... more fields
}
interface Sprint { id: string; name: string; startDate: string; endDate: string; goal: string; status: 'active' | 'future' | 'closed'; }
```

### API Layer Pattern (`api.ts`)

**Snake Case ↔ Camel Case Transformation:**
- All API responses are automatically converted from `snake_case` to `camelCase`
- All API requests are automatically converted from `camelCase` to `snake_case`
- Uses utility functions `fromApi()` and `toApi()` with recursive key transformation

**API Methods:**
```typescript
// Users
api.fetchUsers(): Promise<User[]>
api.createUser(user: Partial<User>): Promise<User>

// Sprints
api.fetchSprints(): Promise<Sprint[]>
api.createSprint(sprint: Partial<Sprint>): Promise<Sprint>

// Tasks
api.fetchTasks(): Promise<Task[]>
api.createTask(task: Partial<Task>): Promise<Task>
api.updateTask(id: string, updates: Partial<Task>): Promise<Task>
api.deleteTask(id: string): Promise<void>
```

**Base URL Configuration:**
- Default: `http://localhost:3344/api`
- Configurable via `VITE_API_BASE_URL` environment variable
- Uses `import.meta.env` for Vite environment variables

### State Management Pattern

**App.tsx** manages global state using React hooks:
- **Data State**: `tasks`, `users`, `sprints` (fetched via API)
- **UI State**: `currentView`, `isDark`, `selectedTask`, modal states
- **Derived State**: `currentSprint`, `sprintTasks`, `currentUser`

**State Flow:**
1. Initial load in `useEffect` fetches all data
2. Updates use optimistic UI updates + API calls
3. Errors are logged to console (no error boundaries visible)

### Dark Mode Implementation

**Approach**: CSS class-based dark mode
- Root element gets `.dark` class toggled via `document.documentElement.classList`
- Tailwind's `dark:` prefix used throughout
- Default theme: Dark mode (HTML has `class="dark"`)
- Configured in `index.html` Tailwind config

### Drag & Drop Pattern (BoardView)

**HTML5 Drag and Drop API:**
```typescript
// On drag start
onDragStart={(e) => e.dataTransfer.setData('taskId', taskId)}

// On drop
onDrop={(e) => {
  const taskId = e.dataTransfer.getData('taskId');
  onTaskUpdate(taskId, newStatus);
}}
```

**Visual Feedback**: 
- `cursor-grabbing` on active drag
- `hover:ring-2 hover:ring-blue-500/50` on cards
- Drop zones highlight on hover

### Modal Pattern

**Consistent Modal Structure:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ... other props
}

if (!isOpen) return null;

return (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white dark:bg-dark-surface w-full max-w-lg rounded-xl shadow-2xl">
      {/* Modal content */}
    </div>
  </div>
);
```

## Styling & UI Patterns

### Tailwind CSS (CDN)
- **Configured in `index.html`** with custom theme
- **Colors**: Custom dark mode colors (`dark:bg-dark-bg`, `dark:border-dark-border`)
- **Typography**: Inter font family
- **Icons**: Material Symbols Outlined (Google Fonts)

### Common Class Patterns

**Dark Mode:**
```tsx
className="bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border"
```

**Interactive Elements:**
```tsx
className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
```

**Buttons:**
```tsx
className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
```

### Responsive Design

- Mobile-first approach
- Flexbox and Grid layouts
- `overflow-x-auto` for horizontal scrolling (BoardView)
- `flex-1` for flexible sizing

## Data Flow

### Initial Load Sequence

1. **App.tsx** mounts → `useEffect` triggers
2. **API calls** in parallel:
   - `api.fetchUsers()`
   - `api.fetchTasks()`
   - `api.fetchSprints()`
3. **State updates** with fetched data
4. **First sprint** automatically selected as `currentSprintId`

### Task Creation Flow

1. User clicks "Create Issue" → Opens `CreateIssueModal`
2. Form submission → `handleCreateTask` in App.tsx
3. **Optimistic update**: Add to local state immediately
4. **API call**: `api.createTask(taskPayload)`
5. **Update state**: Add returned task to `tasks` array

### Task Update Flow

1. User updates task (drag-drop, modal edit)
2. **Optimistic update**: Update local state immediately
3. **API call**: `api.updateTask(taskId, updates)`
4. **Error handling**: Logs error, no rollback visible

## Mock Data (`constants.ts`)

**Note**: This file contains **mock data** for development/testing. The application also uses real API calls via `api.ts`.

**Mock Data Available:**
- `USERS`: 4 sample users with avatars
- `SPRINTS`: 2 sprints (1 active, 1 future)
- `TASKS`: 8 tasks with various statuses, priorities, and types
- `REPORT_DATA`: Chart data for ReportsView
- `TICKET_DISTRIBUTION`: Pie chart data

## Important Gotchas & Notes

### 1. **Component Duplication**
There are duplicate component files in both:
- `components/BoardView.tsx` 
- `components/pages/BoardView.tsx`

**Use the `components/pages/` and `components/organisms/` structure.**

### 2. **No Testing Setup**
- No test framework configured (Jest, Vitest, etc.)
- No test files present
- No test scripts in `package.json`

### 3. **No Error Boundaries**
- Errors are logged to console only
- No global error handling
- No user-facing error messages

### 4. **No Loading States**
- Loading is handled by checking if data exists
- No spinners or skeleton loaders visible in code

### 5. **Comment API Not Implemented**
```typescript
// In App.tsx
const handleAddComment = (taskId: string, text: string) => {
  console.warn("Comment API pending");
};
```

### 6. **ID Generation Strategy**
- Client generates IDs: `t${Date.now()}`, `u${Date.now()}`
- Backend might overwrite (comment in code)
- PHP migration defines ID as VARCHAR(128)

### 7. **Tailwind CDN Usage**
- Not using PostCSS/Build-time Tailwind
- Configured in HTML `<script>` tag
- All styling via CDN (no PurgeCSS)

### 8. **Import Map in HTML**
```html
<script type="importmap">
{
  "imports": {
    "react/": "https://esm.sh/react@^19.2.3/",
    "react": "https://esm.sh/react@^19.2.3",
    "recharts": "https://esm.sh/recharts@^3.6.0"
  }
}
</script>
```

### 9. **Path Aliases**
Configured in `vite.config.ts` and `tsconfig.json`:
```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, '.'),
  }
}

// Usage: import { User } from '@/types';
```

### 10. **API Base URL**
- Default: `http://localhost:3344/api`
- Must be set in `.env` or via environment
- Backend expected to be running on port 3344

## Views & Features

### BoardView
- Kanban board with drag-and-drop
- Columns: To Do, In Progress, Review, Done
- Sprint header with status badge
- Task cards with priority, labels, assignee

### ListView
- Table/list view of tasks
- Same data as BoardView, different presentation

### ReportsView
- Data visualization using Recharts
- Charts for sprint progress and ticket distribution

### TeamView
- Team member management
- Add member functionality

### SettingsView
- Placeholder for settings (empty in current implementation)

## Common Development Tasks

### Adding a New Component
1. Create in appropriate directory (`atoms/`, `molecules/`, `organisms/`, `pages/`)
2. Define Props interface
3. Use PascalCase naming
4. Follow existing styling patterns

### Adding a New API Endpoint
1. Add method to `api.ts`
2. Use `fromApi()` for response transformation
3. Use `toApi()` for request transformation
4. Update `types.ts` if needed

### Modifying Dark Mode Colors
1. Update `index.html` Tailwind config
2. Update CSS variables if used
3. Ensure both light and dark variants exist

### Adding Environment Variables
1. Add to `.env` file
2. Access via `import.meta.env.VITE_...`
3. Update `vite.config.ts` if needed for `define`

## Troubleshooting

### API Connection Issues
- Check if backend is running on port 3344
- Verify `VITE_API_BASE_URL` in `.env`
- Check browser console for fetch errors

### Styling Issues
- Tailwind CDN must load properly
- Check if `.dark` class is on `<html>` element
- Verify custom colors in Tailwind config

### Type Errors
- Run `npm install` to ensure types are available
- Check `tsconfig.json` paths
- Verify imports use correct paths

## Future Considerations

**Missing Features:**
- Authentication/Authorization
- Error boundaries
- Loading states
- Unit/Integration tests
- E2E tests
- CI/CD configuration
- Proper state management (if scale increases)
- Comment functionality
- File attachments
- Real-time updates (WebSockets)

**Technical Debt:**
- Component file duplication
- No error handling beyond console.log
- Mock data mixed with real API
- No validation on forms
- No accessibility testing
