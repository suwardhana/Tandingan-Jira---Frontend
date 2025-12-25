import React from 'react';
import { Task, User } from '../../types';
import PriorityIcon from '../atoms/PriorityIcon';
import StatusBadge from '../atoms/StatusBadge';
import Avatar from '../atoms/Avatar';

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
                                <StatusBadge status={task.status} />
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    {assignee ? (
                                        <>
                                            <Avatar src={assignee.avatar} name={assignee.name} size="sm" />
                                            <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{assignee.name}</span>
                                        </>
                                    ) : (
                                        <span className="text-sm text-slate-400 italic">Unassigned</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <PriorityIcon priority={task.priority} showLabel />
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
