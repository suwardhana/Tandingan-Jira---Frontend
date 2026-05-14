import React from "react";
import { Task, User, IssueType } from "../../types";
import PriorityIcon from "../atoms/PriorityIcon";
import Avatar from "../atoms/Avatar";

interface TaskCardProps {
  task: Task;
  assignee?: User;
  onClick: (task: Task) => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
}

const typeConfig: Record<string, { icon: string; color: string }> = {
  [IssueType.TASK]: { icon: "check_box", color: "text-blue-500" },
  [IssueType.BUG]: { icon: "bug_report", color: "text-red-500" },
};

const TaskCard: React.FC<TaskCardProps> = ({ task, assignee, onClick, onDragStart }) => {
  const typeInfo = typeConfig[task.type] || typeConfig[IssueType.TASK];

  return (
    <div
      onClick={() => onClick(task)}
      className="bg-white dark:bg-slate-800 rounded-card border border-gray-200 dark:border-slate-700 shadow-card hover:shadow-card-hover hover:border-l-[3px] hover:border-l-jira-blue dark:hover:border-l-jira-blue cursor-pointer group transition-all touch-manipulation"
    >
      <div className="p-3">
        {/* Top row: key + priority */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-[16px] ${typeInfo.color}`}>
              {typeInfo.icon}
            </span>
            <span className="text-xs text-text-subtle dark:text-slate-400 font-medium tracking-tight group-hover:text-text-link dark:group-hover:text-jira-blue transition-colors">
              {task.key}
            </span>
          </div>
          <PriorityIcon priority={task.priority} size="sm" />
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-text-primary dark:text-slate-100 mb-2.5 leading-snug line-clamp-2">
          {task.title}
        </p>

        {/* Subtask progress */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mb-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-slate-400">
              check_box
            </span>
            <div className="flex-1 h-1 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-jira-green rounded-full transition-all"
                style={{
                  width: `${(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-2xs text-slate-400 font-medium">
              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
            </span>
          </div>
        )}

        {/* Bottom row: labels + due date + avatar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {(task.labels || []).slice(0, 3).map((label) => (
              <span
                key={label}
                className="px-1.5 py-0.5 rounded-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-2xs font-medium truncate max-w-[80px]"
              >
                {label}
              </span>
            ))}
            {(task.labels || []).length > 3 && (
              <span className="text-2xs text-slate-400 font-medium self-center">
                +{task.labels.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {task.dueDate && (
              <span className="text-2xs text-slate-400 whitespace-nowrap">{task.dueDate}</span>
            )}
            <div className="size-5" title={assignee ? `Assigned to ${assignee.name}` : "Unassigned"}>
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
