import React from 'react';
import { Task, Priority, User } from '../types';

interface ListViewProps {
    tasks: Task[];
    users: User[];
    onTaskClick: (task: Task) => void;
    onCreateClick: () => void;
}

const ListView: React.FC<ListViewProps> = ({ tasks, users, onTaskClick, onCreateClick }) => {
  const getUser = (id?: string) => users.find(u => u.id === id);

  return (
    <div className="px-6 pb-20 overflow-hidden flex flex-col h-full">
      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg shadow-sm custom-scrollbar">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-dark-surface sticky top-0 z-10 border-b border-gray-200 dark:border-dark-border">
                <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12"></th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">Key</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Summary</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-48">Assignee</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">Priority</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32 text-right">Due Date</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {tasks.map(task => {
                    const assignee = getUser(task.assigneeId);
                    return (
                        <tr 
                            key={task.id} 
                            onClick={() => onTaskClick(task)}
                            className="hover:bg-gray-50 dark:hover:bg-dark-surface/50 cursor-pointer transition-colors group"
                        >
                            <td className="px-4 py-3 text-slate-400">
                                <span className="material-symbols-outlined text-[20px] opacity-0 group-hover:opacity-100">drag_indicator</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400">{task.key}</span>
                            </td>
                            <td className="px-4 py-3">
                                <div className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-md">{task.title}</div>
                            </td>
                            <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                                    {task.status}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    {assignee ? (
                                        <>
                                            <img src={assignee.avatar} className="size-6 rounded-full" alt="" />
                                            <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{assignee.name}</span>
                                        </>
                                    ) : (
                                        <span className="text-sm text-slate-400 italic">Unassigned</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                    {task.priority === Priority.HIGH || task.priority === Priority.CRITICAL ? (
                                        <span className="material-symbols-outlined text-red-500 text-[18px]">keyboard_double_arrow_up</span>
                                    ) : task.priority === Priority.LOW ? (
                                        <span className="material-symbols-outlined text-green-500 text-[18px]">keyboard_arrow_down</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-orange-500 text-[18px]">drag_handle</span>
                                    )}
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{task.priority}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {task.dueDate || '-'}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
        <div className="p-2 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface/30">
             <button 
                onClick={onCreateClick}
                className="w-full py-2 flex items-center justify-center gap-2 rounded hover:bg-gray-200 dark:hover:bg-dark-surface text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white text-sm font-medium transition-colors border border-transparent border-dashed hover:border-gray-300 dark:hover:border-gray-600"
            >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Create new issue
            </button>
        </div>
      </div>
    </div>
  );
};

export default ListView;
