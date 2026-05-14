import React from "react";
import { Task, User } from "../../types";
import PriorityIcon from "../atoms/PriorityIcon";
import StatusBadge from "../atoms/StatusBadge";
import Avatar from "../atoms/Avatar";

interface ListViewProps {
  tasks: Task[];
  users: User[];
  onTaskClick: (task: Task) => void;
  onCreateClick: () => void;
}

const ListView: React.FC<ListViewProps> = ({ tasks, users, onTaskClick, onCreateClick }) => {
  const getUser = (id?: string) => users.find((u) => u.id === id);

  return (
    <div className="flex h-full flex-col overflow-hidden px-3 pb-20 sm:px-6">
      <div className="custom-scrollbar flex-1 overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-bg">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 dark:border-dark-border dark:bg-dark-surface">
            <tr>
              <th className="w-12 px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"></th>
              <th className="w-24 px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:w-32 sm:px-4">
                Key
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:px-4">
                Summary
              </th>
              <th className="w-28 px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:w-32 sm:px-4">
                Status
              </th>
              <th className="hidden w-40 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 md:table-cell">
                Assignee
              </th>
              <th className="hidden w-28 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:table-cell">
                Priority
              </th>
              <th className="w-24 px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:w-32 sm:px-4">
                Due Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
            {tasks.map((task) => {
              const assignee = getUser(task.assigneeId);
              return (
                <tr
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="group cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-dark-surface/50"
                >
                  <td className="px-3 py-3 text-slate-400 sm:px-4">
                    <span className="material-symbols-outlined text-[20px] opacity-0 group-hover:opacity-100">
                      drag_indicator
                    </span>
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <span className="font-mono text-xs text-slate-500 group-hover:text-blue-500 dark:text-slate-400 dark:group-hover:text-blue-400">
                      {task.key}
                    </span>
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <div className="max-w-[200px] truncate text-sm font-medium text-slate-900 dark:text-white sm:max-w-md">
                      {task.title}
                    </div>
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex items-center gap-2">
                      {assignee ? (
                        <>
                          <Avatar src={assignee.avatar} name={assignee.name} size="sm" />
                          <span className="truncate text-sm text-slate-600 dark:text-slate-300">
                            {assignee.name}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm italic text-slate-400">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <PriorityIcon priority={task.priority} showLabel />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right text-sm text-slate-500 dark:text-slate-400 sm:px-4">
                    {task.dueDate || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-t border-gray-200 bg-gray-50 p-2 dark:border-dark-border dark:bg-dark-surface/30">
          <button
            onClick={onCreateClick}
            className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-transparent py-2 text-sm font-medium text-slate-500 transition-colors hover:border-gray-300 hover:bg-gray-200 hover:text-slate-700 dark:text-slate-400 dark:hover:border-gray-600 dark:hover:bg-dark-surface dark:hover:text-white"
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
