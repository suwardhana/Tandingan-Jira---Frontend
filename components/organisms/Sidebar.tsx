import React from "react";
import { ViewMode, User } from "../../types";
import Avatar from "../atoms/Avatar";

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { id: ViewMode; icon: string; label: string }[] = [
  { id: "board", icon: "view_kanban", label: "Board" },
  { id: "list", icon: "format_list_bulleted", label: "List" },
  { id: "reports", icon: "bar_chart", label: "Reports" },
  { id: "team", icon: "group", label: "Team" },
  { id: "settings", icon: "settings", label: "Settings" },
];

const Sidebar: React.FC<SidebarProps> = React.memo(
  ({ currentView, onViewChange, isDark, toggleTheme, currentUser, isOpen, onClose }) => {
    const handleNavClick = (view: ViewMode) => {
      onViewChange(view);
      onClose();
    };

    const sidebarContent = (
      <aside className="relative z-30 flex h-full w-56 shrink-0 flex-col justify-between bg-jira-sidebar md:w-16 lg:w-56">
        {/* Top section */}
        <div className="flex flex-col">
          {/* Project header */}
          <div className="px-3 pb-3 pt-5">
            <div className="flex items-center gap-2.5 px-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/20 text-lg font-bold text-white">
                T
              </div>
              <div className="hidden min-w-0 flex-col lg:flex">
                <h1 className="truncate text-sm font-bold leading-tight text-white">TaskFlow</h1>
                <p className="truncate text-2xs leading-tight text-blue-200">Software project</p>
              </div>
            </div>
          </div>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="absolute right-3 top-4 rounded-lg p-1.5 text-blue-200 hover:bg-white/10 hover:text-white md:hidden"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {/* Navigation */}
          <nav className="flex flex-col gap-0.5 px-2">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={item.label}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors md:justify-center lg:justify-start ${
                    isActive
                      ? "bg-jira-sidebar-active text-white"
                      : "text-blue-100 hover:bg-jira-sidebar-hover hover:text-white"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined shrink-0 text-xl ${isActive ? "fill-icon" : ""}`}
                  >
                    {item.icon}
                  </span>
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col gap-2 px-2 pb-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            className="flex items-center justify-between rounded-md px-3 py-2 text-blue-100 transition-colors hover:bg-jira-sidebar-hover hover:text-white md:justify-center lg:justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined shrink-0 text-lg">
                {isDark ? "dark_mode" : "light_mode"}
              </span>
              <span className="hidden text-xs font-medium lg:inline">Theme</span>
            </div>
            <div
              className={`hidden h-4 w-8 rounded-full p-0.5 transition-colors duration-300 lg:block ${
                isDark ? "bg-blue-400" : "bg-blue-300"
              }`}
            >
              <div
                className={`h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  isDark ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </button>

          {/* User profile */}
          <div className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-jira-sidebar-hover md:justify-center lg:justify-start">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="sm"
              className="shrink-0 ring-1 ring-blue-300"
            />
            <div className="hidden min-w-0 flex-col lg:flex">
              <p className="truncate text-xs font-semibold text-white">{currentUser.name}</p>
              <p className="truncate text-2xs text-blue-200">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </aside>
    );

    return (
      <>
        {/* Desktop / tablet sidebar — always visible on md+ */}
        <div className="hidden md:flex">{sidebarContent}</div>

        {/* Mobile overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative h-full">{sidebarContent}</div>
          </div>
        )}
      </>
    );
  },
);

export default Sidebar;
