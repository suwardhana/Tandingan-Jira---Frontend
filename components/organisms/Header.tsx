import React, { useState, useRef } from "react";
import { ViewMode, Sprint } from "../../types";
import NewSprintDialog from "../molecules/NewSprintDialog";

interface HeaderProps {
  currentView: ViewMode;
  onCreateClick: () => void;
  sprints: Sprint[];
  currentSprintId: string;
  onSprintChange: (id: string) => void;
  onMenuToggle: () => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  onCreateSprint: (sprint: Partial<Sprint>) => void;
}

const Header: React.FC<HeaderProps> = React.memo(
  ({
    currentView,
    onCreateClick,
    sprints,
    currentSprintId,
    onSprintChange,
    onMenuToggle,
    searchQuery,
    onSearch,
    onCreateSprint,
  }) => {
    const [showNewSprint, setShowNewSprint] = useState(false);
    const sprintBtnRef = useRef<HTMLButtonElement>(null);

    return (
      <>
        <header className="z-20 flex h-14 shrink-0 items-center border-b border-gray-200 bg-white px-3 dark:border-dark-border dark:bg-slate-900 sm:px-5">
          {/* Left section */}
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
              <div className="ml-1 flex items-center gap-1">
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
                <button
                  ref={sprintBtnRef}
                  onClick={() => setShowNewSprint(true)}
                  className="hidden rounded p-1 text-slate-400 transition-colors hover:bg-gray-100 hover:text-jira-blue dark:hover:bg-slate-800 dark:hover:text-jira-blue sm:block"
                  title="New sprint"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
            )}
          </div>

          {/* Center — search */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <div className="group relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-xl text-slate-400 transition-colors group-focus-within:text-jira-blue">
                search
              </span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-48 rounded-md border border-transparent bg-gray-100 py-1.5 pl-9 pr-8 text-sm text-text-primary placeholder-slate-400 transition-all duration-300 focus:w-64 focus:border-jira-blue focus:ring-1 focus:ring-jira-blue dark:bg-slate-800 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearch("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
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

        <NewSprintDialog
          isOpen={showNewSprint}
          onClose={() => setShowNewSprint(false)}
          onCreate={onCreateSprint}
          anchorRect={sprintBtnRef.current?.getBoundingClientRect()}
        />
      </>
    );
  },
);

export default Header;
