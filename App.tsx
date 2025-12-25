import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BoardView from './components/BoardView';
import ListView from './components/ListView';
import ReportsView from './components/ReportsView';
import TeamView from './components/TeamView';
import SettingsView from './components/SettingsView';
import IssueModal from './components/IssueModal';
import CreateIssueModal from './components/CreateIssueModal';
import AddMemberModal from './components/AddMemberModal';
import { ViewMode, Task, Status, User } from './types';
import { USERS, TASKS, SPRINTS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('board');
  const [isDark, setIsDark] = useState(true);
  
  // Data State
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [users, setUsers] = useState<User[]>(USERS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentSprintId, setCurrentSprintId] = useState<string>(SPRINTS[0].id);
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  // Derived State
  const currentSprint = SPRINTS.find(s => s.id === currentSprintId) || SPRINTS[0];
  const sprintTasks = tasks.filter(t => t.sprintId === currentSprintId);
  const currentUser = users[0];

  // Initialize Dark Mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const handleTaskClick = (task: Task) => setSelectedTask(task);
  const handleCloseModal = () => setSelectedTask(null);
  
  const getCurrentDateFormatted = () => {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Create Task Handler
  const handleCreateTask = (newTask: Partial<Task>) => {
    const task: Task = {
        id: `t${Date.now()}`,
        key: `PROJ-${100 + tasks.length + 1}`,
        title: newTask.title || 'New Task',
        description: newTask.description || '',
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
    setTasks([...tasks, task]);
  };

  // General Update Task Handler
  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === taskId) {
        const updatedTask = { 
            ...t, 
            ...updates,
            updatedAt: getCurrentDateFormatted() 
        };
        // Update selectedTask if it is currently open
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(updatedTask);
        }
        return updatedTask;
      }
      return t;
    }));
  };

  // Add Comment Handler
  const handleAddComment = (taskId: string, text: string) => {
    const newComment = {
      id: `c${Date.now()}`,
      userId: currentUser.id,
      text: text,
      createdAt: 'Just now',
    };
    
    setTasks(prevTasks => prevTasks.map(t => {
       if (t.id === taskId) {
         const updatedTask = { 
             ...t, 
             comments: [...(t.comments || []), newComment],
             updatedAt: getCurrentDateFormatted()
         };
         if (selectedTask && selectedTask.id === taskId) {
           setSelectedTask(updatedTask);
         }
         return updatedTask;
       }
       return t;
    }));
  };

  // Add Member Handler
  const handleAddMember = (user: Partial<User>) => {
    const newUser: User = {
        id: `u${Date.now()}`,
        name: user.name || 'New Member',
        email: user.email || '',
        avatar: user.avatar || '',
        role: user.role || 'Member',
    };
    setUsers([...users, newUser]);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'board':
        return (
            <BoardView 
                tasks={sprintTasks} 
                sprint={currentSprint}
                users={users}
                onTaskClick={handleTaskClick} 
                onTaskUpdate={(id, status) => handleUpdateTask(id, { status })}
                onCreateClick={() => setIsCreateModalOpen(true)}
            />
        );
      case 'list':
        return (
            <ListView 
                tasks={sprintTasks} 
                users={users}
                onTaskClick={handleTaskClick} 
                onCreateClick={() => setIsCreateModalOpen(true)}
            />
        );
      case 'reports':
        return <ReportsView />;
      case 'team':
        return (
            <TeamView 
                users={users} 
                onAddMemberClick={() => setIsAddMemberModalOpen(true)} 
            />
        );
      case 'settings':
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
            sprints={SPRINTS}
            currentSprintId={currentSprintId}
            onSprintChange={setCurrentSprintId}
        />
        
        <main className="flex-1 overflow-hidden pt-6">
            <div className="h-full w-full">
               {renderContent()}
            </div>
        </main>
      </div>

      <IssueModal 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={handleCloseModal} 
        users={users}
        onUpdateTask={handleUpdateTask}
        onAddComment={handleAddComment}
      />

      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTask}
        users={users}
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
