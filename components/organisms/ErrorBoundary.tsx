import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-lg dark:border-dark-border dark:bg-dark-surface">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <span className="material-symbols-outlined text-3xl text-red-500">error</span>
            </div>
            <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              An unexpected error occurred while rendering this view. Try reloading or navigating
              away.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-jira-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-jira-blue-hover"
              >
                Reload page
              </button>
              <button
                onClick={this.handleReset}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Try again
              </button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-500">
                  Error details
                </summary>
                <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-red-50 p-3 text-xs text-red-500 dark:bg-red-900/10">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
