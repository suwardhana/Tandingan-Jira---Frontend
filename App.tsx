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
import ListView from "./components/pages/ListView";
import ReportsView from "./components/pages/ReportsView";
import TeamView from "./components/pages/TeamView";
import SettingsView from "./components/pages/SettingsView";
import IssueModal from "./components/organisms/IssueModal";
import CreateIssueModal from "./components/organisms/CreateIssueModal";
import AddMemberModal from "./components/organisms/AddMemberModal";
import ErrorBoundary from "./components/organisms/ErrorBoundary";
import { ToastProvider, useToast } from "./components/organisms/Toast";
import { SkeletonBoard, SkeletonTable, SkeletonReports } from "./components/atoms/Skeleton";
import { ViewMode, Task, Status, User, Sprint } from "./types";
import { api } from "./api";
import { USERS, SPRINTS, TASKS } from "./constants";

// ── Inner app layout — lives inside BrowserRouter + ToastProvider ──────────

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // ── UI-only state (not URL-derived) ──────────────────────────────────────
  const [isDark, setIsDark] = useState(true);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Data state ───────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [currentSprintId, setCurrentSprintId] = useState<string>("");
  const [dataReady, setDataReady] = useState(false);

  // ── Derive view + modal state from URL ──────────────────────────────────
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const currentView: ViewMode = (
    ["board", "list", "reports", "team", "settings"].includes(pathSegments[0])
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
        if (fetchedSprints.length > 0) setCurrentSprintId(fetchedSprints[0].id);
      } catch {
        console.warn("API unavailable — using mock data from constants.ts");
        setUsers(USERS);
        setTasks(TASKS);
        setSprints(SPRINTS);
        if (SPRINTS.length > 0) setCurrentSprintId(SPRINTS[0].id);
      } finally {
        setDataReady(true);
      }
    };
    loadData();
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────
  const currentSprint = sprints.find((s) => s.id === currentSprintId) || sprints[0];
  const sprintTasks = useMemo(
    () => tasks.filter((t) => t.sprintId === currentSprintId),
    [tasks, currentSprintId],
  );
  const currentUser = users[0] || {
    id: "temp",
    name: "Loading...",
    email: "",
    role: "",
    avatar: "",
  };

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
  const openCreateModal = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("create", "true");
    setSearchParams(params);
  }, [searchParams, setSearchParams]);
  const closeCreateModal = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("create");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getCurrentDateFormatted = () =>
    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // ── Mutation handlers (unchanged logic, added toast feedback) ────────────

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

      try {
        const createdTask = await api.createTask(taskPayload!);
        setTasks((prev) => prev.map((t) => (t.id === taskPayload!.id ? createdTask : t)));
        toast("Issue created successfully", "success");
      } catch {
        toast("Issue saved locally — backend unavailable", "warning");
      }
    },
    [closeCreateModal, toast, currentSprintId, currentUser.id],
  );

  const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      // If status changed, auto-assign order to end of target column
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

  const handleReorder = useCallback((status: Status, orderedTaskIds: string[]) => {
    setTasks((prev) =>
      prev.map((t) => {
        const idx = orderedTaskIds.indexOf(t.id);
        if (idx !== -1) {
          return { ...t, order: idx + 1 };
        }
        return t;
      }),
    );
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

  const handleAddMember = useCallback(
    async (user: Partial<User>) => {
      const newUser: User = {
        id: `u${Date.now()}`,
        name: user.name || "New Member",
        email: user.email || "",
        avatar: user.avatar || "",
        role: user.role || "Member",
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
            onCreateClick={openCreateModal}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            No sprints available
          </div>
        );
      case "list":
        return (
          <ListView
            tasks={sprintTasks}
            users={users}
            onTaskClick={handleTaskClick}
            onCreateClick={openCreateModal}
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
        onAddComment={handleAddComment}
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
        currentSprintId={currentSprintId}
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

// ── Root App — BrowserRouter + ToastProvider ───────────────────────────────

const App: React.FC = () => (
  <BrowserRouter>
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/board" replace />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </ToastProvider>
  </BrowserRouter>
);

export default App;
