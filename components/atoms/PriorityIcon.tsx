import React from "react";
import { Priority } from "../../types";

interface PriorityIconProps {
  priority: Priority;
  showLabel?: boolean;
  size?: "sm" | "md";
}

const config: Record<Priority, { icon: string; color: string; bg: string }> = {
  [Priority.CRITICAL]: {
    icon: "priority_high",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
  [Priority.HIGH]: {
    icon: "arrow_upward",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  [Priority.MEDIUM]: {
    icon: "remove",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  [Priority.LOW]: {
    icon: "arrow_downward",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
};

const PriorityIcon: React.FC<PriorityIconProps> = ({ priority, showLabel = false, size = "md" }) => {
  const { icon, color, bg } = config[priority] || config[Priority.MEDIUM];
  const sizeClass = size === "sm" ? "p-0.5 text-[12px]" : "p-1 text-[16px]";

  return (
    <div className="flex items-center gap-1.5" title={`${priority} Priority`}>
      <span className={`material-symbols-outlined ${sizeClass} rounded font-bold ${color} ${bg}`}>
        {icon}
      </span>
      {showLabel && (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{priority}</span>
      )}
    </div>
  );
};

export default PriorityIcon;
