import React from 'react';
import { Task, Status, Sprint, User } from '../../types';
import TaskCard from '../molecules/TaskCard';

interface BoardViewProps {
  tasks: Task[];
  sprint: Sprint;
  users: User[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (taskId: string, newStatus: Status) => void;
  onCreateClick: () => void;
}

const BoardView: React.FC<BoardViewProps> = ({ tasks, sprint, users, onTaskClick, onTaskUpdate, onCreateClick }) => {
  const columns = Object.values(Status);

  const getTasksByStatus = (status: Status) => tasks.filter(t => t.status === status);
  const getUser = (id?: string) => users.find(u => u.id === id);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
        onTaskUpdate(taskId, status);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
        {/* Sprint Header */}
        <div className="px-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <div>
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{sprint.name}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        sprint.status === 'active' 
                            ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                        {sprint.status}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {sprint.startDate} - {sprint.endDate}
                    </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl truncate">{sprint.goal}</p>
            </div>
            <div className="flex items-center gap-2">
                 <div className="flex -space-x-2 mr-2">
                    {users.slice(0, 3).map(u => (
                        <img key={u.id} src={u.avatar} className="size-8 rounded-full border-2 border-white dark:border-dark-bg" title={u.name} alt={u.name} />
                    ))}
                    {users.length > 3 && (
                        <div className="size-8 rounded-full border-2 border-white dark:border-dark-bg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-500 dark:text-slate-300 font-bold">
                            +{users.length - 3}
                        </div>
                    )}
                 </div>
            </div>
        </div>

        {/* Board Columns */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2 px-6">
            <div className="flex h-full gap-6 min-w-max">
            {columns.map(status => {
                const columnTasks = getTasksByStatus(status);
                return (
                <div 
                    key={status} 
                    className="flex flex-col w-80 max-h-full bg-gray-100 dark:bg-dark-surface/50 rounded-xl border border-gray-200 dark:border-dark-border/50 transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                >
                    {/* Column Header */}
                    <div className="p-4 flex items-center justify-between sticky top-0 bg-inherit rounded-t-xl z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">{status}</h3>
                        <span className="bg-white dark:bg-dark-bg text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-200 dark:border-dark-border">
                        {columnTasks.length}
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <button 
                            onClick={onCreateClick}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-white dark:hover:bg-dark-bg transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                        </button>
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-white dark:hover:bg-dark-bg transition-colors">
                            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                        </button>
                    </div>
                    </div>

                    {/* Column List */}
                    <div className="p-3 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                    {columnTasks.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            assignee={getUser(task.assigneeId)} 
                            onClick={onTaskClick}
                            onDragStart={handleDragStart}
                        />
                    ))}
                    
                    <button 
                        onClick={onCreateClick}
                        className="py-2 flex items-center justify-center gap-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-bg/50 text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span>Create Issue</span>
                    </button>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
    </div>
  );
};

export default BoardView;
