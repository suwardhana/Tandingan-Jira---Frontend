import React from 'react';
import { ViewMode, User } from '../../types';
import Avatar from '../atoms/Avatar';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentUser: User;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isDark, toggleTheme, currentUser }) => {
  const navItems: { id: ViewMode; icon: string; label: string }[] = [
    { id: 'board', icon: 'view_kanban', label: 'Board' },
    { id: 'list', icon: 'format_list_bulleted', label: 'List' },
    { id: 'reports', icon: 'bar_chart', label: 'Reports' },
    { id: 'team', icon: 'group', label: 'Team' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border flex flex-col justify-between shrink-0 transition-colors duration-200 z-30">
      <div className="flex flex-col gap-6 p-4">
        {/* Project Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="size-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg text-white font-bold text-xl">
            T
          </div>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-slate-900 dark:text-white text-base font-bold leading-none truncate">TaskFlow</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 truncate">Software Project</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'fill-icon' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-border flex flex-col gap-4">
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-dark-surface text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">
              {isDark ? 'dark_mode' : 'light_mode'}
            </span>
            <span className="text-xs font-medium">Theme</span>
          </div>
          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${isDark ? 'bg-blue-600' : 'bg-slate-300'}`}>
            <div className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isDark ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-1">
          <Avatar src={currentUser.avatar} name={currentUser.name} size="lg" />
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
