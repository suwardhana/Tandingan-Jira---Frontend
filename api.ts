import { Task, User, Sprint } from "./types";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3344/api";

const headers = {
  "Content-Type": "application/json",
};

// Utility functions to convert between snake_case and camelCase
const snakeToCamel = (str: string): string =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const camelToSnake = (str: string): string =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const transformKeys = <T>(
  obj: any,
  transformer: (key: string) => string
): T => {
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
  // Users
  fetchUsers: async (): Promise<User[]> => {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    const data = await res.json();
    return fromApi<User[]>(data);
  },

  createUser: async (user: Partial<User>): Promise<User> => {
    const res = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers,
      body: JSON.stringify(toApi(user)),
    });
    if (!res.ok) throw new Error("Failed to create user");
    const data = await res.json();
    return fromApi<User>(data);
  },

  // Sprints
  fetchSprints: async (): Promise<Sprint[]> => {
    const res = await fetch(`${BASE_URL}/sprints`);
    if (!res.ok) throw new Error("Failed to fetch sprints");
    const data = await res.json();
    return fromApi<Sprint[]>(data);
  },

  createSprint: async (sprint: Partial<Sprint>): Promise<Sprint> => {
    const res = await fetch(`${BASE_URL}/sprints`, {
      method: "POST",
      headers,
      body: JSON.stringify(toApi(sprint)),
    });
    if (!res.ok) throw new Error("Failed to create sprint");
    const data = await res.json();
    return fromApi<Sprint>(data);
  },

  // Tasks
  fetchTasks: async (): Promise<Task[]> => {
    const res = await fetch(`${BASE_URL}/tasks`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    const data = await res.json();
    return fromApi<Task[]>(data);
  },

  createTask: async (task: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers,
      body: JSON.stringify(toApi(task)),
    });
    if (!res.ok) throw new Error("Failed to create task");
    const data = await res.json();
    return fromApi<Task>(data);
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "PUT", // or PATCH depending on your backend
      headers,
      body: JSON.stringify(toApi(updates)),
    });
    if (!res.ok) throw new Error("Failed to update task");
    const data = await res.json();
    return fromApi<Task>(data);
  },

  deleteTask: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete task");
  },
};
