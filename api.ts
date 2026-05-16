import { Task, User, Sprint, Subtask, Comment } from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3344/api";

const headers = {
  "Content-Type": "application/json",
};

const request = (path: string, options: RequestInit = {}): Promise<Response> =>
  fetch(`${BASE_URL}${path}`, { ...options, credentials: "include" });

// Utility functions to convert between snake_case and camelCase
const snakeToCamel = (str: string): string =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const camelToSnake = (str: string): string =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const transformKeys = <T>(obj: any, transformer: (key: string) => string): T => {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item, transformer)) as T;
  }
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = transformer(key);
      acc[newKey] = transformKeys(obj[key], transformer);
      return acc;
    }, {} as any) as T;
  }
  return obj;
};

// Transform API response (snake_case) to frontend format (camelCase)
const fromApi = <T>(data: any): T => transformKeys<T>(data, snakeToCamel);

// Transform frontend data (camelCase) to API format (snake_case)
const toApi = <T>(data: any): T => transformKeys<T>(data, camelToSnake);

export const api = {
  // ── Auth ─────────────────────────────────────────────────────────────────

  login: async (email: string, password: string): Promise<User> => {
    const res = await request("/auth/login", {
      method: "POST",
      headers,
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
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

  // ── Users ───────────────────────────────────────────────────────────────

  fetchUsers: async (): Promise<User[]> => {
    const res = await request("/users");
    if (!res.ok) throw new Error("Failed to fetch users");
    const data = await res.json();
    return fromApi<User[]>(data);
  },

  createUser: async (user: Partial<User>): Promise<User> => {
    const res = await request("/users", {
      method: "POST",
      headers,
      body: JSON.stringify(toApi(user)),
    });
    if (!res.ok) throw new Error("Failed to create user");
    const data = await res.json();
    return fromApi<User>(data);
  },

  fetchUser: async (id: string): Promise<User> => {
    const res = await request(`/users/${id}`);
    if (!res.ok) throw new Error("Failed to fetch user");
    const data = await res.json();
    return fromApi<User>(data);
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    const res = await request(`/users/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(toApi(updates)),
    });
    if (!res.ok) throw new Error("Failed to update user");
    const data = await res.json();
    return fromApi<User>(data);
  },

  deleteUser: async (id: string): Promise<void> => {
    const res = await request(`/users/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete user");
  },

  // ── Sprints ─────────────────────────────────────────────────────────────

  fetchSprints: async (): Promise<Sprint[]> => {
    const res = await request("/sprints");
    if (!res.ok) throw new Error("Failed to fetch sprints");
    const data = await res.json();
    return fromApi<Sprint[]>(data);
  },

  createSprint: async (sprint: Partial<Sprint>): Promise<Sprint> => {
    const res = await request("/sprints", {
      method: "POST",
      headers,
      body: JSON.stringify(toApi(sprint)),
    });
    if (!res.ok) throw new Error("Failed to create sprint");
    const data = await res.json();
    return fromApi<Sprint>(data);
  },

  updateSprint: async (id: string, updates: Partial<Sprint>): Promise<Sprint> => {
    const res = await request(`/sprints/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(toApi(updates)),
    });
    if (!res.ok) throw new Error("Failed to update sprint");
    const data = await res.json();
    return fromApi<Sprint>(data);
  },

  fetchSprint: async (id: string): Promise<Sprint> => {
    const res = await request(`/sprints/${id}`);
    if (!res.ok) throw new Error("Failed to fetch sprint");
    const data = await res.json();
    return fromApi<Sprint>(data);
  },

  deleteSprint: async (id: string): Promise<void> => {
    const res = await request(`/sprints/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete sprint");
  },

  // ── Tasks ───────────────────────────────────────────────────────────────

  fetchTasks: async (sprintId?: string): Promise<Task[]> => {
    const params = sprintId ? `?sprint_id=${encodeURIComponent(sprintId)}` : "";
    const res = await request(`/tasks${params}`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    const data = await res.json();
    return fromApi<Task[]>(data);
  },

  createTask: async (task: Partial<Task>): Promise<Task> => {
    const res = await request("/tasks", {
      method: "POST",
      headers,
      body: JSON.stringify(toApi(task)),
    });
    if (!res.ok) throw new Error("Failed to create task");
    const data = await res.json();
    return fromApi<Task>(data);
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const res = await request(`/tasks/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(toApi(updates)),
    });
    if (!res.ok) throw new Error("Failed to update task");
    const data = await res.json();
    return fromApi<Task>(data);
  },

  fetchTask: async (id: string): Promise<Task> => {
    const res = await request(`/tasks/${id}`);
    if (!res.ok) throw new Error("Failed to fetch task");
    const data = await res.json();
    return fromApi<Task>(data);
  },

  deleteTask: async (id: string): Promise<void> => {
    const res = await request(`/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete task");
  },

  reorderTasks: async (status: string, taskIds: string[]): Promise<void> => {
    const res = await request("/tasks/reorder", {
      method: "PUT",
      headers,
      body: JSON.stringify(toApi({ status, taskIds })),
    });
    if (!res.ok) throw new Error("Failed to reorder tasks");
  },

  // ── Subtasks ────────────────────────────────────────────────────────────

  fetchSubtasks: async (taskId: string): Promise<Subtask[]> => {
    const res = await request(`/tasks/${taskId}/subtasks`);
    if (!res.ok) throw new Error("Failed to fetch subtasks");
    const data = await res.json();
    return fromApi<Subtask[]>(data);
  },

  createSubtask: async (taskId: string, subtask: Partial<Subtask>): Promise<Subtask> => {
    const res = await request(`/tasks/${taskId}/subtasks`, {
      method: "POST",
      headers,
      body: JSON.stringify(toApi(subtask)),
    });
    if (!res.ok) throw new Error("Failed to create subtask");
    const data = await res.json();
    return fromApi<Subtask>(data);
  },

  updateSubtask: async (id: string, updates: Partial<Subtask>): Promise<Subtask> => {
    const res = await request(`/subtasks/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(toApi(updates)),
    });
    if (!res.ok) throw new Error("Failed to update subtask");
    const data = await res.json();
    return fromApi<Subtask>(data);
  },

  deleteSubtask: async (id: string): Promise<void> => {
    const res = await request(`/subtasks/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete subtask");
  },

  // ── Comments ────────────────────────────────────────────────────────────

  fetchComments: async (taskId: string): Promise<Comment[]> => {
    const res = await request(`/tasks/${taskId}/comments`);
    if (!res.ok) throw new Error("Failed to fetch comments");
    const data = await res.json();
    return fromApi<Comment[]>(data);
  },

  createComment: async (taskId: string, comment: Partial<Comment>): Promise<Comment> => {
    const res = await request(`/tasks/${taskId}/comments`, {
      method: "POST",
      headers,
      body: JSON.stringify(toApi(comment)),
    });
    if (!res.ok) throw new Error("Failed to create comment");
    const data = await res.json();
    return fromApi<Comment>(data);
  },

  updateComment: async (id: string, updates: Partial<Comment>): Promise<Comment> => {
    const res = await request(`/comments/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(toApi(updates)),
    });
    if (!res.ok) throw new Error("Failed to update comment");
    const data = await res.json();
    return fromApi<Comment>(data);
  },

  deleteComment: async (id: string): Promise<void> => {
    const res = await request(`/comments/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete comment");
  },
};
