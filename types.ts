export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export enum Status {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done',
}

export enum IssueType {
  TASK = 'Task',
  BUG = 'Bug',
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role?: string;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  status: 'active' | 'future' | 'closed';
}

export interface Task {
  id: string;
  key: string; // e.g., PROJ-101
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  type: IssueType;
  assigneeId?: string;
  reporterId: string;
  sprintId: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  comments?: Comment[];
  subtasks?: Subtask[];
  attachments?: { name: string; size: string; type: 'pdf' | 'image' | 'other' }[];
}

export type ViewMode = 'board' | 'list' | 'reports' | 'team' | 'settings';
