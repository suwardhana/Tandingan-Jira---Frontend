import React from 'react';
import { ViewMode, Sprint } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onCreateClick: () => void;
  sprints: Sprint[];
  currentSprintId: string;
  onSprintChange: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onCreateClick, sprints, currentSprintId, onSprintChange }) => {
  return (
    <header className="h-16 border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg/50 backdrop-blur-sm flex items-center px-6 justify-between shrink-0 z-20 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <nav className="flex text-sm font-medium text-slate-500 dark:text-slate-400 items-center">
          <span className="hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors hidden sm:inline">Projects</span>
          <span className="mx-2 text-slate-300 dark:text-slate-600 hidden sm:inline">/</span>
          <span className="hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors font-semibold text-slate-900 dark:text-slate-200">TaskFlow</span>
          <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-900 dark:text-white capitalize">{currentView}</span>
        </nav>

        {/* Sprint Selector (Only visible on relevant views) */}
        {(currentView === 'board' || currentView === 'list') && (
            <div className="ml-4 hidden md:block">
                <select 
                    value={currentSprintId}
                    onChange={(e) => onSprintChange(e.target.value)}
                    className="bg-gray-100 dark:bg-dark-surface border-none text-xs rounded-md px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                >
                    {sprints.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                    ))}
                </select>
            </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block group">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-focus-within:text-blue-500 transition-colors">search</span>
            <input 
                type="text" 
                placeholder="Search tasks..." 
                className="pl-9 pr-4 py-1.5 bg-gray-100 dark:bg-dark-surface border-none rounded-lg text-sm w-48 focus:w-64 focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-500 transition-all duration-300"
            />
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-dark-border mx-2"></div>

        <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-bg"></span>
        </button>

        <button 
            onClick={onCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
        >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden sm:inline">Create</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
