import React from 'react';
import { Status } from '../../types';

interface StatusBadgeProps {
  status: Status | string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-gray-700 whitespace-nowrap ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
