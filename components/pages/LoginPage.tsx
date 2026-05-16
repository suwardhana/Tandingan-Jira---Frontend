import React, { useState } from "react";

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-dark-bg">
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-8 shadow-modal dark:bg-dark-surface"
        >
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-jira-blue text-xl font-bold text-white">
              T
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">TaskFlow</h1>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  mail
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-jira-blue focus:outline-none focus:ring-2 focus:ring-jira-blue/20 disabled:opacity-50 dark:border-dark-border dark:bg-dark-bg dark:text-white dark:placeholder-slate-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  lock
                </span>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-jira-blue focus:outline-none focus:ring-2 focus:ring-jira-blue/20 disabled:opacity-50 dark:border-dark-border dark:bg-dark-bg dark:text-white dark:placeholder-slate-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center rounded-lg bg-jira-blue py-2.5 text-sm font-semibold text-white transition-colors hover:bg-jira-blue-hover disabled:opacity-60"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-lg">
                  progress_activity
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
          TaskFlow — Project Management
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
