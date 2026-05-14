import React from "react";

const SettingsView: React.FC = () => {
  return (
    <div className="custom-scrollbar h-full max-w-4xl overflow-y-auto px-3 pb-6 sm:px-6">
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Project Settings</h2>

      <div className="space-y-6">
        {/* General Settings */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-surface">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-blue-500">tune</span>
            General
          </h3>
          <div className="grid gap-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Project Name
              </label>
              <input
                type="text"
                defaultValue="TaskFlow Project Alpha"
                className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-slate-900 dark:border-dark-border dark:bg-dark-bg dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Project Key
              </label>
              <input
                type="text"
                defaultValue="PROJ"
                disabled
                className="w-full cursor-not-allowed rounded-lg border-gray-200 bg-gray-100 text-sm text-slate-500 dark:border-dark-border dark:bg-dark-bg/50 dark:text-slate-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                rows={3}
                defaultValue="Main software development project for the Q4 release."
                className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-slate-900 dark:border-dark-border dark:bg-dark-bg dark:text-white"
              ></textarea>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-surface">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-orange-500">notifications</span>
            Notifications
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Email Notifications
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Receive emails about ticket updates
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-jira-blue peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Slack Integration
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Post updates to #dev-updates
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-jira-blue peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              </label>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button className="rounded-md bg-jira-blue px-6 py-2 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-jira-blue-hover">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
