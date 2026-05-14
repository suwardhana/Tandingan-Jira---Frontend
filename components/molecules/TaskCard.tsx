import React from "react";
import { Task, User, IssueType } from "../../types";
import PriorityIcon from "../atoms/PriorityIcon";
import Avatar from "../atoms/Avatar";

interface TaskCardProps {
  task: Task;
  assignee?: User;
  onClick: (task: Task) => void;
}

const typeConfig: Record<string, { icon: string; color: string }> = {
  [IssueType.TASK]: { icon: "check_box", color: "text-blue-500" },
  [IssueType.BUG]: { icon: "bug_report", color: "text-red-500" },
};

const TaskCard: React.FC<TaskCardProps> = ({ task, assignee, onClick }) => {
  const typeInfo = typeConfig[task.type] || typeConfig[IssueType.TASK];

  return (
    <div
      onClick={() => onClick(task)}
      className="group cursor-pointer touch-manipulation rounded-card border border-gray-200 bg-white shadow-card transition-all hover:border-l-[3px] hover:border-l-jira-blue hover:shadow-card-hover dark:border-slate-700 dark:bg-slate-800 dark:hover:border-l-jira-blue"
    >
      <div className="p-3">
        {/* Top row: key + priority */}
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-[16px] ${typeInfo.color}`}>
              {typeInfo.icon}
            </span>
            <span className="text-xs font-medium tracking-tight text-text-subtle transition-colors group-hover:text-text-link dark:text-slate-400 dark:group-hover:text-jira-blue">
              {task.key}
            </span>
          </div>
          <PriorityIcon priority={task.priority} size="sm" />
        </div>

        {/* Title */}
        <p className="mb-2.5 line-clamp-2 text-sm font-medium leading-snug text-text-primary dark:text-slate-100">
          {task.title}
        </p>

        {/* Subtask progress */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mb-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-slate-400">check_box</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-jira-green transition-all"
                style={{
                  width: `${(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-2xs font-medium text-slate-400">
              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
            </span>
          </div>
        )}

        {/* Bottom row: labels + due date + avatar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap gap-1">
            {(task.labels || []).slice(0, 3).map((label) => (
              <span
                key={label}
                className="max-w-[80px] truncate rounded-sm bg-blue-50 px-1.5 py-0.5 text-2xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-300"
              >
                {label}
              </span>
            ))}
            {(task.labels || []).length > 3 && (
              <span className="self-center text-2xs font-medium text-slate-400">
                +{task.labels.length - 3}
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {task.dueDate && (
              <span className="whitespace-nowrap text-2xs text-slate-400">{task.dueDate}</span>
            )}
            <div
              className="size-5"
              title={assignee ? `Assigned to ${assignee.name}` : "Unassigned"}
            >
              <Avatar
                src={assignee?.avatar}
                name={assignee?.name}
                size="sm"
                className="ring-1 ring-white dark:ring-slate-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
