import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Sidebar from "./components/organisms/Sidebar";
import Header from "./components/organisms/Header";
import BoardView from "./components/pages/BoardView";
import BacklogView from "./components/pages/BacklogView";
import ListView from "./components/pages/ListView";
import ReportsView from "./components/pages/ReportsView";
import TeamView from "./components/pages/TeamView";
import SettingsView from "./components/pages/SettingsView";
import LoginPage from "./components/pages/LoginPage";
import IssueModal from "./components/organisms/IssueModal";
import CreateIssueModal from "./components/organisms/CreateIssueModal";
import AddMemberModal from "./components/organisms/AddMemberModal";
import ErrorBoundary from "./components/organisms/ErrorBoundary";
import { ToastProvider, useToast } from "./components/organisms/Toast";
import { SkeletonBoard, SkeletonTable, SkeletonReports } from "./components/atoms/Skeleton";
import { ViewMode, Task, Status, Priority, IssueType, User, Sprint } from "./types";
import { api } from "./api";
import { USERS, SPRINTS, TASKS } from "./constants";

// ── Auth splash shown while checking session ──────────────────────────────

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

// ── AppLayout props ────────────────────────────────────────────────────────

interface AppLayoutProps {
  authUser: User;
  onLogout: () => Promise<void>;
}

// ── Inner app layout — only rendered when authenticated ────────────────────

const AppLayout: React.FC<AppLayoutProps> = ({ authUser, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // ── UI-only state (not URL-derived) ──────────────────────────────────────
  const [isDark, setIsDark] = useState(true);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssigneeId, setFilterAssigneeId] = useState<string | null>(null);
  const [showMyTasksOnly, setShowMyTasksOnly] = useState(false);
  const [createSprintId, setCreateSprintId] = useState<string | null>(null);

  // ── Data state ───────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [currentSprintId, setCurrentSprintId] = useState<string>("");
  const [dataReady, setDataReady] = useState(false);

  // ── Derive view + modal state from URL ──────────────────────────────────
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const currentView: ViewMode = (
    ["board", "backlog", "list", "reports", "team", "settings"].includes(pathSegments[0])
      ? pathSegments[0]
      : "board"
  ) as ViewMode;

  const taskKey = pathSegments[1] === "task" ? pathSegments[2] : undefined;
  const selectedTask = useMemo(() => {
    if (!taskKey || !dataReady) return null;
    return tasks.find((t) => t.key === taskKey) ?? null;
  }, [taskKey, tasks, dataReady]);

  const showCreate = searchParams.get("create") === "true";

  // ── Initial data load ───────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedUsers, fetchedTasks, fetchedSprints] = await Promise.all([
          api.fetchUsers(),
          api.fetchTasks(),
          api.fetchSprints(),
        ]);
        setUsers(fetchedUsers);
        setTasks(fetchedTasks);
        setSprints(fetchedSprints);
        if (fetchedSprints.length > 0)
          setCurrentSprintId(
            fetchedSprints.find((s) => s.status === "active")?.id || fetchedSprints[0].id,
          );
      } catch {
        console.warn("API unavailable — using mock data from constants.ts");
        setUsers(USERS);
        setTasks(TASKS);
        setSprints(SPRINTS);
        if (SPRINTS.length > 0)
          setCurrentSprintId(SPRINTS.find((s) => s.status === "active")?.id || SPRINTS[0].id);
      } finally {
        setDataReady(true);
      }
    };
    loadData();
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────
  const currentSprint = sprints.find((s) => s.id === currentSprintId) || sprints[0];
  const currentUser = authUser;

  const sprintTasks = useMemo(() => {
    let filtered = tasks.filter((t) => t.sprintId === currentSprintId);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q),
      );
    }
    if (showMyTasksOnly) {
      filtered = filtered.filter((t) => t.assigneeId === currentUser.id);
    }
    if (filterAssigneeId) {
      filtered = filtered.filter((t) => t.assigneeId === filterAssigneeId);
    }
    return filtered;
  }, [tasks, currentSprintId, searchQuery, showMyTasksOnly, filterAssigneeId, currentUser.id]);

  // ── Dark mode ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // ── URL-based navigation ────────────────────────────────────────────────
  const handleViewChange = useCallback((view: ViewMode) => navigate(`/${view}`), [navigate]);
  const handleTaskClick = useCallback(
    (task: Task) => navigate(`/${currentView}/task/${task.key}`),
    [navigate, currentView],
  );
  const handleCloseModal = useCallback(() => navigate(-1), [navigate]);
  const openCreateModal = useCallback((sprintId?: string) => {
    if (sprintId) setCreateSprintId(sprintId);
    const params = new URLSearchParams(searchParams);
    params.set("create", "true");
    setSearchParams(params);
  }, [searchParams, setSearchParams]);
  const closeCreateModal = useCallback(() => {
    setCreateSprintId(null);
    const params = new URLSearchParams(searchParams);
    params.delete("create");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getCurrentDateFormatted = () =>
    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // ── Mutation handlers ────────────────────────────────────────────────────

  const handleCreateTask = useCallback(
    async (newTask: Partial<Task>) => {
      let taskPayload: Task;
      setTasks((prev) => {
        taskPayload = {
          id: `t${Date.now()}`,
          key: `PROJ-${100 + prev.length + 1}`,
          title: newTask.title || "New Task",
          description: newTask.description || "",
          status: newTask.status || Status.TODO,
          priority: newTask.priority as any,
          type: newTask.type as any,
          assigneeId: newTask.assigneeId,
          reporterId: newTask.reporterId || currentUser.id,
          sprintId: newTask.sprintId || currentSprintId,
          labels: newTask.labels || [],
          dueDate: newTask.dueDate,
          comments: [],
          order: prev.filter((t) => t.status === (newTask.status || Status.TODO)).length + 1,
          createdAt: getCurrentDateFormatted(),
          updatedAt: getCurrentDateFormatted(),
        };
        return [...prev, taskPayload];
      });
      closeCreateModal();

      const tempId = taskPayload!.id;
      try {
        const createdTask = await api.createTask(taskPayload!);
        setTasks((prev) => prev.map((t) => (t.id === tempId ? createdTask : t)));
        toast("Issue created successfully", "success");
      } catch {
        toast("Issue saved locally — backend unavailable", "warning");
      }
    },
    [closeCreateModal, toast, currentSprintId, currentUser.id],
  );

  const handleQuickCreate = useCallback(
    async (title: string, sprintId?: string) => {
      let taskPayload: Task;
      setTasks((prev) => {
        taskPayload = {
          id: `t${Date.now()}`,
          key: `PROJ-${100 + prev.length + 1}`,
          title,
          description: "",
          status: Status.TODO,
          priority: Priority.MEDIUM as any,
          type: IssueType.TASK as any,
          assigneeId: undefined,
          reporterId: currentUser.id,
          sprintId: sprintId,
          labels: [],
          comments: [],
          order: prev.filter((t) => t.status === Status.TODO).length + 1,
          createdAt: getCurrentDateFormatted(),
          updatedAt: getCurrentDateFormatted(),
        };
        return [...prev, taskPayload];
      });

      const tempId = taskPayload!.id;
      try {
        const createdTask = await api.createTask(taskPayload!);
        setTasks((prev) => prev.map((t) => (t.id === tempId ? createdTask : t)));
        toast("Issue created", "success");
      } catch {
        toast("Issue saved locally", "warning");
      }
    },
    [toast, currentUser.id],
  );

  const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      if (updates.status) {
        const maxOrder = prev
          .filter((t) => t.status === updates.status && t.id !== taskId)
          .reduce((max, t) => Math.max(max, t.order ?? 0), 0);
        return prev.map((t) =>
          t.id === taskId ? { ...t, ...updates, order: updates.order ?? maxOrder + 1 } : t,
        );
      }
      return prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
    });
    try {
      await api.updateTask(taskId, updates);
    } catch {
      console.warn("API unavailable — update applied locally only");
    }
  }, []);

  const handleReorder = useCallback(async (status: Status, orderedTaskIds: string[]) => {
    setTasks((prev) =>
      prev.map((t) => {
        const idx = orderedTaskIds.indexOf(t.id);
        if (idx !== -1) {
          return { ...t, order: idx + 1 };
        }
        return t;
      }),
    );
    try {
      await api.reorderTasks(status, orderedTaskIds);
    } catch {
      console.warn("API unavailable — reorder applied locally only");
    }
  }, []);

  const handleAddComment = useCallback(
    async (taskId: string, text: string) => {
      try {
        const createdComment = await api.createComment(taskId, { text, userId: currentUser.id });
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, comments: [...(t.comments || []), createdComment] } : t,
          ),
        );
        toast("Comment added", "success");
      } catch {
        toast("Comment saved locally", "warning");
      }
    },
    [toast, currentUser.id],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      handleCloseModal();
      try {
        await api.deleteTask(taskId);
        toast("Issue deleted", "success");
      } catch {
        toast("Issue deletion saved locally", "warning");
      }
    },
    [toast, handleCloseModal],
  );

  const handleUpdateComment = useCallback(async (commentId: string, text: string) => {
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        comments: (t.comments || []).map((c) => (c.id === commentId ? { ...c, text } : c)),
      })),
    );
    try {
      await api.updateComment(commentId, { text });
    } catch {
      console.warn("API unavailable — comment update local only");
    }
  }, []);

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          comments: (t.comments || []).filter((c) => c.id !== commentId),
        })),
      );
      try {
        await api.deleteComment(commentId);
        toast("Comment deleted", "success");
      } catch {
        toast("Comment deletion saved locally", "warning");
      }
    },
    [toast],
  );

  const handleAddMember = useCallback(
    async (user: Partial<User>) => {
      const newUser = {
        id: `u${Date.now()}`,
        name: user.name || "New Member",
        email: user.email || "",
        avatar: user.avatar || "",
        role: user.role || "Member",
        password: "changeme123",
      };
      setUsers((prev) => [...prev, newUser]);
      try {
        const createdUser = await api.createUser(newUser);
        setUsers((prev) => prev.map((u) => (u.id === newUser.id ? createdUser : u)));
        toast("Member added", "success");
      } catch {
        toast("Member saved locally", "warning");
      }
    },
    [toast],
  );

  const handleAddSubtask = useCallback(
    async (taskId: string, title: string) => {
      try {
        const createdSubtask = await api.createSubtask(taskId, { title });
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), createdSubtask] } : t,
          ),
        );
        toast("Subtask added", "success");
      } catch {
        toast("Subtask saved locally", "warning");
      }
    },
    [toast],
  );

  const handleDeleteSubtask = useCallback(
    async (subtaskId: string) => {
      try {
        await api.deleteSubtask(subtaskId);
        setTasks((prev) =>
          prev.map((t) => ({
            ...t,
            subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId),
          })),
        );
        toast("Subtask deleted", "success");
      } catch {
        toast("Subtask deletion saved locally", "warning");
      }
    },
    [toast],
  );

  const handleToggleSubtask = useCallback(async (subtaskId: string, completed: boolean) => {
    try {
      await api.updateSubtask(subtaskId, { completed });
      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          subtasks: (t.subtasks || []).map((s) => (s.id === subtaskId ? { ...s, completed } : s)),
        })),
      );
    } catch {
      console.warn("API unavailable — subtask toggle local only");
    }
  }, []);

  // ── Sprint lifecycle handlers ────────────────────────────────────────────

  const handleCreateSprint = useCallback(
    async (sprint: Partial<Sprint>) => {
      const tempId = `s${Date.now()}`;
      const newSprint: Sprint = {
        id: tempId,
        name: sprint.name || "New Sprint",
        startDate: sprint.startDate || getCurrentDateFormatted(),
        endDate: sprint.endDate || "",
        goal: sprint.goal || "",
        status: "future",
      };
      setSprints((prev) => [...prev, newSprint]);
      try {
        const created = await api.createSprint(sprint);
        setSprints((prev) => prev.map((s) => (s.id === tempId ? created : s)));
        toast("Sprint created", "success");
      } catch {
        toast("Sprint saved locally — backend unavailable", "warning");
      }
    },
    [toast],
  );

  const handleStartSprint = useCallback(
    async (sprintId: string) => {
      let previousStatus: string | undefined;
      setSprints((prev) => {
        const sprint = prev.find((s) => s.id === sprintId);
        previousStatus = sprint?.status;
        return prev.map((s) => (s.id === sprintId ? { ...s, status: "active" as const } : s));
      });
      try {
        await api.updateSprint(sprintId, { status: "active" as const });
        toast("Sprint started", "success");
      } catch {
        setSprints((prev) =>
          prev.map((s) =>
            s.id === sprintId && previousStatus ? { ...s, status: previousStatus as Sprint["status"] } : s,
          ),
        );
        toast("Failed to start sprint", "error");
      }
    },
    [toast],
  );

  const handleCompleteSprint = useCallback(
    async (sprintId: string) => {
      let previousStatus: string | undefined;
      setSprints((prev) => {
        const sprint = prev.find((s) => s.id === sprintId);
        previousStatus = sprint?.status;
        return prev.map((s) => (s.id === sprintId ? { ...s, status: "closed" as const } : s));
      });
      try {
        await api.updateSprint(sprintId, { status: "closed" as const });
        toast("Sprint completed", "success");
      } catch {
        setSprints((prev) =>
          prev.map((s) =>
            s.id === sprintId && previousStatus ? { ...s, status: previousStatus as Sprint["status"] } : s,
          ),
        );
        toast("Failed to complete sprint", "error");
      }
    },
    [toast],
  );

  // ── View rendering ──────────────────────────────────────────────────────
  const renderContent = () => {
    if (!dataReady) {
      switch (currentView) {
        case "board":
          return <SkeletonBoard />;
        case "list":
          return <SkeletonTable rows={6} />;
        case "reports":
          return <SkeletonReports />;
        default:
          return <SkeletonTable rows={4} />;
      }
    }

    switch (currentView) {
      case "board":
        return currentSprint ? (
          <BoardView
            tasks={sprintTasks}
            sprint={currentSprint}
            users={users}
            onTaskClick={handleTaskClick}
            onTaskUpdate={handleUpdateTask}
            onReorder={handleReorder}
            onStartSprint={handleStartSprint}
            onCompleteSprint={handleCompleteSprint}
            filterAssigneeId={filterAssigneeId}
            onFilterAssignee={setFilterAssigneeId}
            showMyTasksOnly={showMyTasksOnly}
            onToggleMyTasks={() => setShowMyTasksOnly((v) => !v)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            No sprints available
          </div>
        );
      case "backlog":
        return (
          <BacklogView
            tasks={tasks}
            sprints={sprints}
            users={users}
            onTaskClick={handleTaskClick}
            onTaskUpdate={handleUpdateTask}
            onStartSprint={handleStartSprint}
            onCompleteSprint={handleCompleteSprint}
            searchQuery={searchQuery}
            onCreateForSprint={(sprintId) => openCreateModal(sprintId)}
            onQuickCreate={handleQuickCreate}
          />
        );
      case "list":
        return (
          <ListView
            tasks={sprintTasks}
            users={users}
            onTaskClick={handleTaskClick}
            onCreateClick={openCreateModal}
            filterAssigneeId={filterAssigneeId}
            onFilterAssignee={setFilterAssigneeId}
            showMyTasksOnly={showMyTasksOnly}
            onToggleMyTasks={() => setShowMyTasksOnly((v) => !v)}
          />
        );
      case "reports":
        return <ReportsView tasks={tasks} sprints={sprints} />;
      case "team":
        return <TeamView users={users} onAddMemberClick={() => setIsAddMemberModalOpen(true)} />;
      case "settings":
        return <SettingsView />;
      default:
        return null;
    }
  };

  const viewKey = pathSegments[0] || "board";

  return (
    <div className="flex h-screen bg-gray-50 transition-colors duration-200 dark:bg-dark-bg">
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        isDark={isDark}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          currentView={currentView}
          onCreateClick={openCreateModal}
          sprints={sprints}
          currentSprintId={currentSprintId}
          onSprintChange={setCurrentSprintId}
          onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onCreateSprint={handleCreateSprint}
        />

        <main className="flex-1 overflow-hidden pt-4 sm:pt-6">
          <ErrorBoundary key={viewKey}>
            <div className="h-full w-full">{renderContent()}</div>
          </ErrorBoundary>
        </main>
      </div>

      {/* Task detail modal — driven by URL */}
      <IssueModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={handleCloseModal}
        users={users}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onAddComment={handleAddComment}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={handleDeleteComment}
        onAddSubtask={handleAddSubtask}
        onDeleteSubtask={handleDeleteSubtask}
        onToggleSubtask={handleToggleSubtask}
      />

      {/* Create modal — driven by ?create=true */}
      <CreateIssueModal
        isOpen={showCreate}
        onClose={closeCreateModal}
        onCreate={handleCreateTask}
        users={users}
        sprints={sprints}
        currentSprintId={createSprintId ?? currentSprintId}
      />

      {/* Add member modal — still local state */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onAdd={handleAddMember}
      />
    </div>
  );
};

// ── Root App — auth gate + BrowserRouter + ToastProvider ────────────────────

const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  const handleLogin = useCallback(async (email: string, password: string) => {
    const user = await api.login(email, password);
    setAuthUser(user);
  }, []);

  const handleLogout = useCallback(async () => {
    await api.logout();
    setAuthUser(null);
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        {authLoading ? (
          <LoginSplash />
        ) : authUser ? (
          <Routes>
            <Route path="/" element={<Navigate to="/board" replace />} />
            <Route path="/*" element={<AppLayout authUser={authUser} onLogout={handleLogout} />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/*" element={<LoginPage onLogin={handleLogin} />} />
          </Routes>
        )}
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
