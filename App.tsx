import React, { useState, useEffect } from "react";
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
import { ViewMode, Task, Status, User, Sprint } from "./types";
import { api } from "./api";
import { USERS, SPRINTS, TASKS } from "./constants";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>("board");
  const [isDark, setIsDark] = useState(true);

  // Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentSprintId, setCurrentSprintId] = useState<string>("");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  // Initial Load — falls back to mock data when API is unavailable
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
        if (fetchedSprints.length > 0) {
          setCurrentSprintId(fetchedSprints[0].id);
        }
      } catch {
        console.warn("API unavailable — using mock data from constants.ts");
        setUsers(USERS);
        setTasks(TASKS);
        setSprints(SPRINTS);
        if (SPRINTS.length > 0) {
          setCurrentSprintId(SPRINTS[0].id);
        }
      }
    };
    loadData();
  }, []);

  // Derived State
  const currentSprint =
    sprints.find((s) => s.id === currentSprintId) || sprints[0];
  const sprintTasks = tasks.filter((t) => t.sprintId === currentSprintId);
  const currentUser = users[0] || {
    id: "temp",
    name: "Loading...",
    email: "",
    role: "",
    avatar: "",
  };

  // Initialize Dark Mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const handleTaskClick = (task: Task) => setSelectedTask(task);
  const handleCloseModal = () => setSelectedTask(null);

  const getCurrentDateFormatted = () => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Create Task Handler
  const handleCreateTask = async (newTask: Partial<Task>) => {
    const taskPayload: Task = {
      id: `t${Date.now()}`,
      key: `PROJ-${100 + tasks.length + 1}`,
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
      createdAt: getCurrentDateFormatted(),
      updatedAt: getCurrentDateFormatted(),
    };

    // Optimistic update first
    setTasks([...tasks, taskPayload]);

    try {
      const createdTask = await api.createTask(taskPayload);
      // Replace optimistic ID with server-assigned one
      setTasks((prev) => prev.map((t) => (t.id === taskPayload.id ? createdTask : t)));
    } catch {
      console.warn("API unavailable — task saved locally only");
    }
  };

  // General Update Task Handler
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Optimistic update
      const updatedLocal = tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      );
      setTasks(updatedLocal);

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, ...updates });
      }

      await api.updateTask(taskId, updates);
    } catch {
      console.warn("API unavailable — update applied locally only");
    }
  };

  // Add Comment Handler
  const handleAddComment = async (taskId: string, text: string) => {
    try {
      const createdComment = await api.createComment(taskId, {
        text,
        userId: currentUser.id,
      });

      // Update local state
      const updatedTasks = tasks.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...(t.comments || []), createdComment] }
          : t
      );
      setTasks(updatedTasks);

      // Update selected task if it's the one being modified
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          comments: [...(selectedTask.comments || []), createdComment],
        });
      }
    } catch {
      console.warn("API unavailable — comment saved locally only");
    }
  };

  // Add Member Handler
  const handleAddMember = async (user: Partial<User>) => {
    const newUser: User = {
      id: `u${Date.now()}`,
      name: user.name || "New Member",
      email: user.email || "",
      avatar: user.avatar || "",
      role: user.role || "Member",
    };

    // Optimistic update first
    setUsers([...users, newUser]);

    try {
      const createdUser = await api.createUser(newUser);
      setUsers((prev) => prev.map((u) => (u.id === newUser.id ? createdUser : u)));
    } catch {
      console.warn("API unavailable — member saved locally only");
    }
  };

  // Subtask Handlers
  const handleAddSubtask = async (taskId: string, title: string) => {
    try {
      const createdSubtask = await api.createSubtask(taskId, { title });

      // Update local state
      const updatedTasks = tasks.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: [...(t.subtasks || []), createdSubtask] }
          : t
      );
      setTasks(updatedTasks);

      // Update selected task if it's the one being modified
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          subtasks: [...(selectedTask.subtasks || []), createdSubtask],
        });
      }
    } catch {
      console.warn("API unavailable — subtask saved locally only");
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await api.deleteSubtask(subtaskId);

      // Update local state - remove subtask from all tasks
      const updatedTasks = tasks.map((t) => ({
        ...t,
        subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId),
      }));
      setTasks(updatedTasks);

      // Update selected task if needed
      if (selectedTask) {
        setSelectedTask({
          ...selectedTask,
          subtasks: (selectedTask.subtasks || []).filter(
            (s) => s.id !== subtaskId
          ),
        });
      }
    } catch {
      console.warn("API unavailable — subtask deletion local only");
    }
  };

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    try {
      await api.updateSubtask(subtaskId, { completed });

      // Update local state
      const updatedTasks = tasks.map((t) => ({
        ...t,
        subtasks: (t.subtasks || []).map((s) =>
          s.id === subtaskId ? { ...s, completed } : s
        ),
      }));
      setTasks(updatedTasks);

      // Update selected task if needed
      if (selectedTask) {
        setSelectedTask({
          ...selectedTask,
          subtasks: (selectedTask.subtasks || []).map((s) =>
            s.id === subtaskId ? { ...s, completed } : s
          ),
        });
      }
    } catch {
      console.warn("API unavailable — subtask toggle local only");
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "board":
        return currentSprint ? (
          <BoardView
            tasks={sprintTasks}
            sprint={currentSprint}
            users={users}
            onTaskClick={handleTaskClick}
            onTaskUpdate={(id, status) => handleUpdateTask(id, { status })}
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div>Loading Sprints...</div>
        );
      case "list":
        return (
          <ListView
            tasks={sprintTasks}
            users={users}
            onTaskClick={handleTaskClick}
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        );
      case "reports":
        return <ReportsView />;
      case "team":
        return (
          <TeamView
            users={users}
            onAddMemberClick={() => setIsAddMemberModalOpen(true)}
          />
        );
      case "settings":
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isDark={isDark}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentView={currentView}
          onCreateClick={() => setIsCreateModalOpen(true)}
          sprints={sprints}
          currentSprintId={currentSprintId}
          onSprintChange={setCurrentSprintId}
        />

        <main className="flex-1 overflow-hidden pt-6">
          <div className="h-full w-full">{renderContent()}</div>
        </main>
      </div>

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

      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTask}
        users={users}
        sprints={sprints}
        currentSprintId={currentSprintId}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onAdd={handleAddMember}
      />
    </div>
  );
};

export default App;
