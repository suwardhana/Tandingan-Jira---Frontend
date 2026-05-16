# Login Page & Session-Based Auth — Implementation Plan

## Overview

Add session-based authentication to the TaskFlow frontend. The backend already has working auth endpoints (`POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`) and an `auth` filter protecting all `/api` routes. The frontend currently has no auth — it loads data anonymously and falls back to mock data on failure.

## Current state

| Layer                  | What exists                                                                       |
| ---------------------- | --------------------------------------------------------------------------------- |
| Backend auth endpoints | Done — login/logout/me in `AuthController`, session stored in `ci_sessions` table |
| Backend auth filter    | Done — `AuthFilter` checks `session()->has('user_id')`, returns 401               |
| Backend CORS           | `supportsCredentials: true` but only allows `localhost:5173` origin               |
| Frontend API layer     | No auth methods in `api.ts`, no `credentials: 'include'` on fetch calls           |
| Frontend App           | `currentUser` is hardcoded to `users[0]`, no login/logout UI                      |

## Backend changes (1 file)

### 1. `app/Config/Cors.php` — Add frontend origin

The frontend dev server runs on port 3000. Add it to `allowedOrigins`:

```php
// Before
'allowedOrigins' => ['http://localhost:5173'],
// After
'allowedOrigins' => ['http://localhost:3000', 'http://localhost:5173'],
```

`supportsCredentials` is already `true` — no other CORS changes needed.

---

## Frontend changes (4 files)

### 1. `api.ts` — Add auth methods and credentials

**Add `credentials: 'include'` to all fetch calls** so the browser sends the session cookie cross-origin (port 3000 → 3344). Without this, the backend won't see `ci_session` and every request will get 401.

The simplest approach: add it once to the shared `headers`-style options, or better, create a shared fetch wrapper:

```typescript
// Add as a module-level constant alongside `headers`
const fetchOptions: RequestInit = {
  credentials: "include",
};
```

Then spread `...fetchOptions` into every `fetch()` call alongside `headers` and `method`.

Or, more practically — since there are ~16 fetch calls — add a small internal helper:

```typescript
const request = (path: string, options: RequestInit = {}): Promise<Response> =>
  fetch(`${BASE_URL}${path}`, { ...options, credentials: "include" });
```

Then replace all `fetch(...)` calls with `request(...)`.

**Add three auth methods to the `api` object:**

```typescript
login: async (email: string, password: string): Promise<User> => {
  const res = await request("/auth/login", {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }
  return fromApi<User>(await res.json());
},

logout: async (): Promise<void> => {
  await request("/auth/logout", { method: "POST" });
},

fetchMe: async (): Promise<User> => {
  const res = await request("/auth/me");
  if (!res.ok) throw new Error("Not authenticated");
  return fromApi<User>(await res.json());
},
```

Note: login request body uses `email`/`password` which are already snake_case, so no `toApi()` wrapping needed. The response is a User object that still needs `fromApi()` for `created_at` → `createdAt` etc.

---

### 2. `components/pages/LoginPage.tsx` — New login page

Full-screen centered card layout. No sidebar, no header — this renders outside `AppLayout`.

**Props:**

```typescript
interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
}
```

**States:**

- `email` / `password` — controlled inputs
- `error` — string or null, shown as red alert below the form
- `loading` — disables button + inputs during API call

**Visual design:**

- Full viewport centered layout: `min-h-screen flex items-center justify-center`
- Background: `bg-gray-100 dark:bg-dark-bg`
- Card: `bg-white dark:bg-dark-surface rounded-xl shadow-modal p-8 w-full max-w-sm`
- Logo area: TaskFlow "T" icon + "TaskFlow" title in jira-blue
- Email input: standard text input with envelope icon
- Password input: standard password input with lock icon
- Submit button: full-width `bg-jira-blue hover:bg-jira-blue-hover text-white`, shows spinner when loading
- Error alert: red background `bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400`
- Simple footer text below card: "TaskFlow — Project Management"

Use Material Symbols for input icons (`mail`, `lock`). Follow existing patterns — no new dependencies.

**No mock data fallback.** Login either works (real backend) or shows an error.

---

### 3. `App.tsx` — Auth state, route protection, login/logout handlers

This is the largest change. The current `App` component needs to become auth-aware.

**New auth flow:**

```
App mounts
  └─ authLoading = true
  └─ call api.fetchMe()
       ├─ success → authUser = user, authLoading = false, load data normally
       └─ 401 → authUser = null, authLoading = false, show LoginPage
```

**New state variables** (add to `AppLayout`):

```typescript
const [authUser, setAuthUser] = useState<User | null>(null);
const [authLoading, setAuthLoading] = useState(true);
```

**Auth check on mount** (replaces or wraps the existing data-loading `useEffect`):

```typescript
useEffect(() => {
  const initAuth = async () => {
    try {
      const me = await api.fetchMe();
      setAuthUser(me);
    } catch {
      setAuthUser(null);
    } finally {
      setAuthLoading(false);
    }
  };
  initAuth();
}, []);
```

**Data loading** — only trigger after auth succeeds. Use a second `useEffect` that depends on `authUser`:

```typescript
useEffect(() => {
  if (!authUser) return;
  const loadData = async () => {
    // ... existing parallel fetchUsers/fetchTasks/fetchSprints ...
  };
  loadData();
}, [authUser]);
```

**Login handler:**

```typescript
const handleLogin = useCallback(async (email: string, password: string) => {
  const user = await api.login(email, password);
  setAuthUser(user);
}, []);
```

**Logout handler:**

```typescript
const handleLogout = useCallback(async () => {
  await api.logout();
  setAuthUser(null);
  setTasks([]);
  setUsers([]);
  setSprints([]);
  setDataReady(false);
}, []);
```

**Replace `currentUser` hardcoding.** Currently line 95-101:

```typescript
// Before
const currentUser = users[0] || { id: "temp", name: "Loading...", ... };

// After
const currentUser = authUser;
```

`currentUser` will always be non-null when AppLayout renders (because AppLayout only renders when `authUser` is set). If a component needs `currentUser` before that, it won't be mounted yet.

**Route protection in the root `App` component:**

```typescript
const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // auth check useEffect here...

  return (
    <BrowserRouter>
      <ToastProvider>
        {authLoading ? (
          <LoginSplash />  // full-screen loading while checking session
        ) : authUser ? (
          <AppLayout
            authUser={authUser}
            onLogout={async () => {
              await api.logout();
              setAuthUser(null);
            }}
          />
        ) : (
          <LoginPage
            onLogin={async (email, password) => {
              const user = await api.login(email, password);
              setAuthUser(user);
            }}
          />
        )}
      </ToastProvider>
    </BrowserRouter>
  );
};
```

**Move `authUser` and `onLogout` up** to the root `App` component. `AppLayout` receives them as props. This avoids rendering `AppLayout` (with its data-loading effects) when the user is not authenticated.

**`LoginSplash`** — a simple centered spinner/logo shown during the ~200ms auth check:

```tsx
const LoginSplash: React.FC = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-dark-bg">
    <div className="flex flex-col items-center gap-4">
      <div className="flex size-12 items-center justify-center rounded-xl bg-jira-blue text-xl font-bold text-white">
        T
      </div>
      <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-dark-surface" />
    </div>
  </div>
);
```

**Remove the `currentUser = users[0]` fallback** — it's no longer needed. `currentUser` is always `authUser`.

**`AppLayout` signature changes:**

```typescript
interface AppLayoutProps {
  authUser: User;
  onLogout: () => Promise<void>;
}

const AppLayout: React.FC<AppLayoutProps> = ({ authUser, onLogout }) => {
  // ... existing code, but:
  // - use `authUser` everywhere instead of `users[0]`
  // - data loading useEffect depends on authUser being non-null (always true here)
  // - pass onLogout to Sidebar
};
```

**Pass `onLogout` and `authUser` to Sidebar:**

```tsx
<Sidebar
  currentView={currentView}
  onViewChange={handleViewChange}
  isDark={isDark}
  toggleTheme={toggleTheme}
  currentUser={authUser}
  onLogout={onLogout} // new prop
  isOpen={isSidebarOpen}
  onClose={() => setIsSidebarOpen(false)}
/>
```

---

### 4. `components/organisms/Sidebar.tsx` — Logout button

Add `onLogout` prop and wire it to the user profile section at the bottom.

**New prop:**

```typescript
interface SidebarProps {
  // ... existing props ...
  onLogout: () => Promise<void>;
}
```

**User profile section** — currently lines 109-121 show name/role/avatar. Replace the plain `div` with a button that opens a small dropdown, or add a direct logout action. Simplest approach: clicking the user area shows a logout option.

Two options (recommend the simpler inline approach):

**Option A — Click user area to logout** (simplest):

Wrap the existing user section in a `<button>` and add a logout icon on hover:

```tsx
<button
  onClick={onLogout}
  title="Log out"
  className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-jira-sidebar-hover md:justify-center lg:justify-between"
>
  <div className="flex items-center gap-2.5">
    <Avatar ... />
    <div className="hidden min-w-0 flex-col lg:flex">
      <p className="truncate text-xs font-semibold text-white">{currentUser.name}</p>
      <p className="truncate text-2xs text-blue-200">{currentUser.role}</p>
    </div>
  </div>
  <span className="material-symbols-outlined hidden text-lg text-blue-200 lg:inline">
    logout
  </span>
</button>
```

**Option B — Small dropdown with "Log out"** (more explicit, slightly more work):

Clicking the user area toggles a small menu with "Log out" option. This follows the Jira pattern more closely.

Go with **Option B** — it's clearer UX and matches Jira. Implementation:

```tsx
const [showUserMenu, setShowUserMenu] = useState(false);

// In the user profile section:
<div className="relative">
  <button
    onClick={() => setShowUserMenu(!showUserMenu)}
    className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-jira-sidebar-hover md:justify-center lg:justify-start"
  >
    <Avatar ... />
    <div className="hidden min-w-0 flex-col lg:flex">
      <p className="truncate text-xs font-semibold text-white">{currentUser.name}</p>
      <p className="truncate text-2xs text-blue-200">{currentUser.role}</p>
    </div>
  </button>

  {showUserMenu && (
    <>
      <div className="fixed inset-0 z-50" onClick={() => setShowUserMenu(false)} />
      <div className="absolute bottom-full left-2 z-50 mb-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-modal dark:border-dark-border dark:bg-dark-surface">
        <div className="border-b border-gray-100 px-3 py-2 dark:border-dark-border">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{currentUser.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
        </div>
        <button
          onClick={async () => { setShowUserMenu(false); await onLogout(); }}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-dark-bg"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Log out
        </button>
      </div>
    </>
  )}
</div>
```

---

## Execution order

| Step | File                               | What                                                                                                |
| ---- | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1    | `app/Config/Cors.php`              | Add `http://localhost:3000` to allowedOrigins                                                       |
| 2    | `api.ts`                           | Add `credentials: "include"` to all requests, add `login`/`logout`/`fetchMe` methods                |
| 3    | `components/pages/LoginPage.tsx`   | Create new login page component                                                                     |
| 4    | `App.tsx`                          | Move auth state to root, add route protection, add LoginSplash, thread `authUser` + `onLogout` down |
| 5    | `components/organisms/Sidebar.tsx` | Add user menu dropdown with logout action                                                           |

## What doesn't change

- **Backend controllers/models** — auth is already fully implemented
- **All other pages/components** — they already receive `currentUser` via props; the value just now comes from auth instead of `users[0]`
- **Mock data fallback** — still works for tasks/sprints/users lists (only triggers after auth succeeds, i.e., when the backend is reachable)
- **constants.ts** — unchanged
- **Toast/ErrorBoundary** — unchanged

## Edge cases

| Scenario                           | Behavior                                                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Session expires mid-session        | Next API call gets 401 → no rollback (existing behavior). Next page load → `fetchMe` fails → user sees login page |
| Wrong password                     | Backend returns 401 with `{ error: "Invalid credentials" }` → LoginPage shows error message                       |
| Backend unreachable on login       | `fetch` throws → LoginPage shows "Cannot connect to server"                                                       |
| Backend unreachable on `/me` check | `fetchMe` throws → show login page (safe default)                                                                 |
| Password field empty               | Backend returns 400 with `{ error: "Email and password are required" }` → LoginPage shows error                   |
| Browser blocks third-party cookies | `credentials: "include"` still works for localhost (same effective domain) — no issue                             |
| Logout during modal open           | All modal state resets because `authUser` becomes null and `AppLayout` unmounts                                   |
