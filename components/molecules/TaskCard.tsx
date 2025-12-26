import React from "react";
import { Task, User } from "../../types";
import PriorityIcon from "../atoms/PriorityIcon";
import Avatar from "../atoms/Avatar";

interface TaskCardProps {
  task: Task;
  assignee?: User;
  onClick: (task: Task) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  assignee,
  onClick,
  onDragStart,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onClick(task)}
      className="bg-white dark:bg-dark-bg p-4 rounded-lg border border-gray-200 dark:border-dark-border shadow-sm hover:ring-2 hover:ring-blue-500/50 dark:hover:ring-blue-400/50 cursor-pointer group transition-all active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-500 dark:text-slate-400 text-xs font-medium hover:underline hover:text-blue-500 transition-colors">
          {task.key}
        </span>
        <PriorityIcon priority={task.priority} />
      </div>

      <h4 className="text-slate-900 dark:text-white font-medium text-sm mb-3 leading-snug line-clamp-2">
        {task.title}
      </h4>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
          <span className="material-symbols-outlined text-[14px]">
            check_box
          </span>
          <span>
            {task.subtasks.filter((s) => s.completed).length}/
            {task.subtasks.length} subtasks
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-2">
          {(task.labels || []).slice(0, 2).map((label) => (
            <span
              key={label}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold tracking-wide uppercase border border-gray-200 dark:border-gray-700"
            >
              {label}
            </span>
          ))}
        </div>

        <div
          className="size-6"
          title={assignee ? `Assigned to ${assignee.name}` : "Unassigned"}
        >
          <Avatar
            src={assignee?.avatar}
            name={assignee?.name}
            size="md"
            className="ring-1 ring-gray-200 dark:ring-gray-700"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
