import React from "react";

const shimmer =
  "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%]";

export const SkeletonCard: React.FC = () => (
  <div
    className={`rounded-card border border-gray-200 bg-white p-3 dark:border-dark-border dark:bg-dark-bg ${shimmer}`}
  >
    <div className="mb-2 flex items-start justify-between">
      <div className="h-3 w-16 rounded bg-gray-300 dark:bg-slate-600" />
      <div className="h-4 w-4 rounded bg-gray-300 dark:bg-slate-600" />
    </div>
    <div className="mb-3 space-y-2">
      <div className="h-4 w-full rounded bg-gray-300 dark:bg-slate-600" />
      <div className="h-4 w-3/5 rounded bg-gray-300 dark:bg-slate-600" />
    </div>
    <div className="mt-auto flex items-center justify-between">
      <div className="flex gap-2">
        <div className="h-5 w-12 rounded bg-gray-300 dark:bg-slate-600" />
        <div className="h-5 w-10 rounded bg-gray-300 dark:bg-slate-600" />
      </div>
      <div className="size-6 rounded-full bg-gray-300 dark:bg-slate-600" />
    </div>
  </div>
);

export const SkeletonColumn: React.FC<{ cardCount?: number }> = ({ cardCount = 3 }) => (
  <div className="flex max-h-full w-[85vw] flex-none flex-col rounded-xl border border-gray-200 bg-gray-100 dark:border-dark-border/50 dark:bg-dark-surface/50 sm:w-72">
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className={`h-4 w-24 rounded ${shimmer}`} />
        <div className={`h-5 w-6 rounded-full ${shimmer}`} />
      </div>
    </div>
    <div className="flex flex-1 flex-col gap-3 p-3">
      {Array.from({ length: cardCount }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

export const SkeletonBoard: React.FC = () => (
  <div className="flex h-full flex-col overflow-hidden">
    <div className="shrink-0 space-y-2 px-6 pb-4">
      <div className={`h-7 w-48 rounded ${shimmer}`} />
      <div className={`h-4 w-96 rounded ${shimmer}`} />
    </div>
    <div className="flex-1 overflow-hidden px-6 pb-2">
      <div className="flex h-full gap-6">
        <SkeletonColumn cardCount={2} />
        <SkeletonColumn cardCount={1} />
        <SkeletonColumn cardCount={2} />
        <SkeletonColumn cardCount={0} />
      </div>
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="flex h-full flex-col overflow-hidden px-6 pb-20">
    <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-bg">
      <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-dark-border dark:bg-dark-surface">
        <div className={`h-4 w-full rounded ${shimmer}`} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-gray-100 p-4 dark:border-dark-border">
          <div className={`h-5 w-full rounded ${shimmer}`} />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonText: React.FC<{ width?: string; className?: string }> = ({
  width = "w-full",
  className = "",
}) => <div className={`h-4 ${width} rounded ${shimmer} ${className}`} />;

export const SkeletonAvatar: React.FC<{ size?: string }> = ({ size = "size-8" }) => (
  <div className={`${size} rounded-full ${shimmer}`} />
);

export const SkeletonMetric: React.FC = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-surface">
    <div className="mb-4 flex items-center justify-between">
      <div className={`size-10 rounded-lg ${shimmer}`} />
    </div>
    <div className={`h-4 w-24 rounded ${shimmer} mb-2`} />
    <div className={`h-8 w-16 rounded ${shimmer}`} />
  </div>
);

export const SkeletonReports: React.FC = () => (
  <div className="h-full space-y-6 px-6 pb-12">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <SkeletonMetric />
      <SkeletonMetric />
      <SkeletonMetric />
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-surface lg:col-span-2">
        <div className={`h-6 w-48 rounded ${shimmer} mb-6`} />
        <div className={`h-[300px] rounded ${shimmer}`} />
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-surface">
        <div className={`h-6 w-36 rounded ${shimmer} mb-6`} />
        <div className={`h-[220px] rounded ${shimmer}`} />
      </div>
    </div>
  </div>
);
