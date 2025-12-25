import React from 'react';
import { Priority } from '../../types';

interface PriorityIconProps {
  priority: Priority;
  showLabel?: boolean;
}

const PriorityIcon: React.FC<PriorityIconProps> = ({ priority, showLabel = false }) => {
  const getIcon = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'keyboard_double_arrow_up';
      case Priority.CRITICAL: return 'block';
      case Priority.LOW: return 'keyboard_arrow_down';
      default: return 'drag_handle';
    }
  };

  const getColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'text-orange-500 bg-orange-500/10';
      case Priority.CRITICAL: return 'text-red-500 bg-red-500/10';
      case Priority.LOW: return 'text-green-500 bg-green-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  const iconColorClass = getColor(priority);
  // Split bg and text for the label version if needed, but for now we keep the wrapper style
  
  return (
    <div className="flex items-center gap-1.5">
        <div className={`p-1 rounded ${iconColorClass}`} title={`${priority} Priority`}>
            <span className="material-symbols-outlined text-[16px] block font-bold">
                {getIcon(priority)}
            </span>
        </div>
        {showLabel && (
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{priority}</span>
        )}
    </div>
  );
};

export default PriorityIcon;
