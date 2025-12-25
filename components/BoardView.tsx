import React from 'react';
import { Task, Status, Priority, Sprint, User } from '../types';

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

  const getPriorityIcon = (p: Priority) => {
    switch (p) {
        case Priority.HIGH: return 'keyboard_double_arrow_up';
        case Priority.CRITICAL: return 'block';
        case Priority.LOW: return 'keyboard_arrow_down';
        default: return 'drag_handle'; // Medium
    }
  };

  const getPriorityColor = (p: Priority) => {
      switch (p) {
        case Priority.HIGH: return 'text-orange-500 bg-orange-500/10';
        case Priority.CRITICAL: return 'text-red-500 bg-red-500/10';
        case Priority.LOW: return 'text-green-500 bg-green-500/10';
        default: return 'text-blue-500 bg-blue-500/10';
      }
  };

  const getUser = (id?: string) => users.find(u => u.id === id);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

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
                    {columnTasks.map(task => {
                        const assignee = getUser(task.assigneeId);
                        return (
                        <div 
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onClick={() => onTaskClick(task)}
                            className="bg-white dark:bg-dark-bg p-4 rounded-lg border border-gray-200 dark:border-dark-border shadow-sm hover:ring-2 hover:ring-blue-500/50 dark:hover:ring-blue-400/50 cursor-pointer group transition-all active:cursor-grabbing"
                        >
                            <div className="flex justify-between items-start mb-2">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium hover:underline hover:text-blue-500 transition-colors">
                                {task.key}
                            </span>
                            <div className={`p-1 rounded ${getPriorityColor(task.priority)}`} title={`${task.priority} Priority`}>
                                <span className="material-symbols-outlined text-[16px] block font-bold">{getPriorityIcon(task.priority)}</span>
                            </div>
                            </div>
                            
                            <h4 className="text-slate-900 dark:text-white font-medium text-sm mb-3 leading-snug line-clamp-2">
                            {task.title}
                            </h4>

                            {task.subtasks && task.subtasks.length > 0 && (
                                <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
                                    <span className="material-symbols-outlined text-[14px]">check_box</span>
                                    <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-auto">
                            <div className="flex gap-2">
                                {task.labels.slice(0, 2).map(label => (
                                <span key={label} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold tracking-wide uppercase border border-gray-200 dark:border-gray-700">
                                    {label}
                                </span>
                                ))}
                            </div>
                            
                            {assignee ? (
                                <div className="size-6 rounded-full overflow-hidden border border-white dark:border-dark-bg ring-1 ring-gray-200 dark:ring-gray-700" title={`Assigned to ${assignee.name}`}>
                                    <img src={assignee.avatar} alt={assignee.name} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="size-6 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600">
                                    <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                                </div>
                            )}
                            </div>
                        </div>
                        );
                    })}
                    
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
