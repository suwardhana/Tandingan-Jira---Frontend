import React from "react";
import { Status } from "../../types";

interface StatusBadgeProps {
  status: Status | string;
  className?: string;
}

const colorMap: Record<string, string> = {
  [Status.TODO]:
    "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300 border-gray-200 dark:border-gray-700",
  [Status.IN_PROGRESS]:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  [Status.REVIEW]:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  [Status.DONE]:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
};

const dotMap: Record<string, string> = {
  [Status.TODO]: "bg-gray-500",
  [Status.IN_PROGRESS]: "bg-blue-500",
  [Status.REVIEW]: "bg-purple-500",
  [Status.DONE]: "bg-green-500",
};

const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ status, className = "" }) => {
  const colors = colorMap[status] || colorMap[Status.TODO];
  const dot = dotMap[status] || dotMap[Status.TODO];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium ${colors} whitespace-nowrap ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
});

export default StatusBadge;
