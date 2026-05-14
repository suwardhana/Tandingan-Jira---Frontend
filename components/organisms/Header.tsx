import React from "react";
import { ViewMode, Sprint } from "../../types";

interface HeaderProps {
  currentView: ViewMode;
  onCreateClick: () => void;
  sprints: Sprint[];
  currentSprintId: string;
  onSprintChange: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  currentView,
  onCreateClick,
  sprints,
  currentSprintId,
  onSprintChange,
}) => {
  return (
    <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 dark:border-dark-border dark:bg-slate-900">
      <div className="flex items-center gap-3">
        {/* Breadcrumb nav */}
        <nav className="flex items-center text-sm font-medium text-text-subtle dark:text-slate-400">
          <span className="hidden cursor-pointer transition-colors hover:text-text-primary dark:hover:text-white sm:inline">
            Projects
          </span>
          <span className="mx-1.5 hidden text-slate-300 dark:text-slate-600 sm:inline">/</span>
          <span className="cursor-pointer font-semibold text-text-primary transition-colors hover:text-text-primary dark:text-white dark:hover:text-white">
            TaskFlow
          </span>
          <span className="mx-1.5 text-slate-300 dark:text-slate-600">/</span>
          <span className="font-medium capitalize text-text-primary dark:text-white">
            {currentView}
          </span>
        </nav>

        {/* Sprint selector */}
        {(currentView === "board" || currentView === "list") && sprints.length > 0 && (
          <div className="ml-2 hidden md:block">
            <select
              value={currentSprintId}
              onChange={(e) => onSprintChange(e.target.value)}
              className="cursor-pointer rounded-md border-none bg-gray-100 px-3 py-1.5 text-xs font-medium text-text-primary focus:ring-2 focus:ring-jira-blue dark:bg-slate-800 dark:text-slate-200"
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
        <div className="group relative hidden md:block">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-xl text-slate-400 transition-colors group-focus-within:text-jira-blue">
            search
          </span>
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-48 rounded-md border border-transparent bg-gray-100 py-1.5 pl-9 pr-4 text-sm text-text-primary placeholder-slate-400 transition-all duration-300 focus:w-64 focus:border-jira-blue focus:ring-1 focus:ring-jira-blue dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-slate-700" />

        {/* Notifications */}
        <button className="relative rounded-full p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-jira-blue dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-jira-blue">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-white bg-jira-red dark:border-slate-900" />
        </button>

        {/* Create button */}
        <button
          onClick={onCreateClick}
          className="flex items-center gap-1.5 rounded-md bg-jira-blue px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-jira-blue-hover active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span className="hidden sm:inline">Create</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
