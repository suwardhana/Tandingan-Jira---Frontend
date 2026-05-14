import React from "react";
import { ViewMode, Sprint } from "../../types";

interface HeaderProps {
  currentView: ViewMode;
  onCreateClick: () => void;
  sprints: Sprint[];
  currentSprintId: string;
  onSprintChange: (id: string) => void;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = React.memo(
  ({
    currentView,
    onCreateClick,
    sprints,
    currentSprintId,
    onSprintChange,
    onMenuToggle,
  }) => {
    return (
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 dark:border-dark-border dark:bg-slate-900 sm:px-5">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger — mobile & tablet */}
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-gray-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          {/* Breadcrumb nav */}
          <nav className="flex items-center text-sm font-medium text-text-subtle dark:text-slate-400">
            <span className="hidden cursor-pointer transition-colors hover:text-text-primary dark:hover:text-white sm:inline">
              Projects
            </span>
            <span className="mx-1 hidden text-slate-300 dark:text-slate-600 sm:inline">/</span>
            <span className="cursor-pointer font-semibold text-text-primary transition-colors hover:text-text-primary dark:text-white dark:hover:text-white">
              TaskFlow
            </span>
            <span className="mx-1 hidden text-slate-300 dark:text-slate-600 sm:inline">/</span>
            <span className="hidden font-medium capitalize text-text-primary dark:text-white sm:inline">
              {currentView}
            </span>
          </nav>

          {/* Sprint selector */}
          {(currentView === "board" || currentView === "list") && sprints.length > 0 && (
            <div className="ml-1 hidden sm:block">
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

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="group relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-xl text-slate-400 transition-colors group-focus-within:text-jira-blue">
              search
            </span>
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-32 rounded-md border border-transparent bg-gray-100 py-1.5 pl-9 pr-4 text-sm text-text-primary placeholder-slate-400 transition-all duration-300 focus:w-48 focus:border-jira-blue focus:ring-1 focus:ring-jira-blue dark:bg-slate-800 dark:text-white lg:w-48 lg:focus:w-64"
            />
          </div>

          <div className="mx-1 hidden h-5 w-px bg-gray-200 dark:bg-slate-700 sm:block" />

          {/* Notifications */}
          <button className="relative rounded-full p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-jira-blue dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-jira-blue">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-white bg-jira-red dark:border-slate-900" />
          </button>

          {/* Create button */}
          <button
            onClick={onCreateClick}
            className="flex items-center gap-1.5 rounded-md bg-jira-blue px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-jira-blue-hover active:scale-95 sm:px-4"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span className="hidden sm:inline">Create</span>
          </button>
        </div>
      </header>
    );
  },
);

export default Header;
