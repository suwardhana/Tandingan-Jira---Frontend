import React from "react";
import { useLocation } from "react-router-dom";
import { ViewMode, User } from "../../types";
import Avatar from "../atoms/Avatar";

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentUser: User;
}

const navItems: { id: ViewMode; icon: string; label: string }[] = [
  { id: "board", icon: "view_kanban", label: "Board" },
  { id: "list", icon: "format_list_bulleted", label: "List" },
  { id: "reports", icon: "bar_chart", label: "Reports" },
  { id: "team", icon: "group", label: "Team" },
  { id: "settings", icon: "settings", label: "Settings" },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isDark, toggleTheme, currentUser }) => {
  return (
    <aside className="w-56 bg-jira-sidebar flex flex-col justify-between shrink-0 z-30">
      {/* Top section */}
      <div className="flex flex-col">
        {/* Project header */}
        <div className="px-3 pt-5 pb-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="size-8 rounded-md bg-white/20 flex items-center justify-center text-white font-bold text-lg">
              T
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-white text-sm font-bold leading-tight truncate">TaskFlow</h1>
              <p className="text-blue-200 text-2xs leading-tight truncate">Software project</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-2 flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-jira-sidebar-active text-white"
                    : "text-blue-100 hover:bg-jira-sidebar-hover hover:text-white"
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${isActive ? "fill-icon" : ""}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="px-2 pb-3 flex flex-col gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between px-3 py-2 rounded-md text-blue-100 hover:bg-jira-sidebar-hover hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              {isDark ? "dark_mode" : "light_mode"}
            </span>
            <span className="text-xs font-medium">Theme</span>
          </div>
          <div
            className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${
              isDark ? "bg-blue-400" : "bg-blue-300"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
                isDark ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-jira-sidebar-hover transition-colors cursor-pointer">
          <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" className="ring-1 ring-blue-300" />
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
            <p className="text-2xs text-blue-200 truncate">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
