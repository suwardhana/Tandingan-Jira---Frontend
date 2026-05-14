import React from "react";
import { ViewMode, Sprint } from "../../types";

interface HeaderProps {
  currentView: ViewMode;
  onCreateClick: () => void;
  sprints: Sprint[];
  currentSprintId: string;
  onSprintChange: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onCreateClick, sprints, currentSprintId, onSprintChange }) => {
  return (
    <header className="h-14 border-b border-gray-200 dark:border-dark-border bg-white dark:bg-slate-900 flex items-center px-5 justify-between shrink-0 z-20">
      <div className="flex items-center gap-3">
        {/* Breadcrumb nav */}
        <nav className="flex items-center text-sm font-medium text-text-subtle dark:text-slate-400">
          <span className="hover:text-text-primary dark:hover:text-white cursor-pointer transition-colors hidden sm:inline">
            Projects
          </span>
          <span className="mx-1.5 text-slate-300 dark:text-slate-600 hidden sm:inline">/</span>
          <span className="hover:text-text-primary dark:hover:text-white cursor-pointer transition-colors font-semibold text-text-primary dark:text-white">
            TaskFlow
          </span>
          <span className="mx-1.5 text-slate-300 dark:text-slate-600">/</span>
          <span className="text-text-primary dark:text-white capitalize font-medium">{currentView}</span>
        </nav>

        {/* Sprint selector */}
        {(currentView === "board" || currentView === "list") && sprints.length > 0 && (
          <div className="ml-2 hidden md:block">
            <select
              value={currentSprintId}
              onChange={(e) => onSprintChange(e.target.value)}
              className="bg-gray-100 dark:bg-slate-800 border-none text-xs rounded-md px-3 py-1.5 text-text-primary dark:text-slate-200 focus:ring-2 focus:ring-jira-blue cursor-pointer font-medium"
            >
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block group">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-jira-blue transition-colors">
            search
          </span>
          <input
            type="text"
            placeholder="Search tasks..."
            className="pl-9 pr-4 py-1.5 bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-jira-blue rounded-md text-sm w-48 focus:w-64 focus:ring-1 focus:ring-jira-blue text-text-primary dark:text-white placeholder-slate-400 transition-all duration-300"
          />
        </div>

        <div className="h-5 w-px bg-gray-200 dark:bg-slate-700 mx-1" />

        {/* Notifications */}
        <button className="relative p-1.5 text-slate-500 dark:text-slate-400 hover:text-jira-blue dark:hover:text-jira-blue hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-jira-red rounded-full border-2 border-white dark:border-slate-900" />
        </button>

        {/* Create button */}
        <button
          onClick={onCreateClick}
          className="bg-jira-blue hover:bg-jira-blue-hover text-white px-4 py-1.5 rounded-md text-sm font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span className="hidden sm:inline">Create</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
