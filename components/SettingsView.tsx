import React from 'react';

const SettingsView: React.FC = () => {
  return (
    <div className="px-6 pb-6 h-full overflow-y-auto custom-scrollbar max-w-4xl">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Project Settings</h2>
      
      <div className="space-y-6">
        {/* General Settings */}
        <section className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">tune</span>
                General
            </h3>
            <div className="grid gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                    <input type="text" defaultValue="TaskFlow Project Alpha" className="w-full rounded-lg bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-slate-900 dark:text-white text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Key</label>
                    <input type="text" defaultValue="PROJ" disabled className="w-full rounded-lg bg-gray-100 dark:bg-dark-bg/50 border-gray-200 dark:border-dark-border text-slate-500 dark:text-slate-500 text-sm cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <textarea rows={3} defaultValue="Main software development project for the Q4 release." className="w-full rounded-lg bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-slate-900 dark:text-white text-sm"></textarea>
                </div>
            </div>
        </section>

        {/* Notifications */}
        <section className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">notifications</span>
                Notifications
            </h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Email Notifications</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Receive emails about ticket updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Slack Integration</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Post updates to #dev-updates</p>
                    </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
        </section>
        
        <div className="flex justify-end pt-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
