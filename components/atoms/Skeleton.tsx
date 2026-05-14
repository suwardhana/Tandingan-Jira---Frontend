import React from "react";

const shimmer =
  "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%]";

export const SkeletonCard: React.FC = () => (
  <div className={`bg-white dark:bg-dark-bg p-4 rounded-lg border border-gray-200 dark:border-dark-border ${shimmer}`}>
    <div className="flex justify-between items-start mb-2">
      <div className="h-3 w-16 bg-gray-300 dark:bg-slate-600 rounded" />
      <div className="h-4 w-4 bg-gray-300 dark:bg-slate-600 rounded" />
    </div>
    <div className="space-y-2 mb-3">
      <div className="h-4 w-full bg-gray-300 dark:bg-slate-600 rounded" />
      <div className="h-4 w-3/5 bg-gray-300 dark:bg-slate-600 rounded" />
    </div>
    <div className="flex items-center justify-between mt-auto">
      <div className="flex gap-2">
        <div className="h-5 w-12 bg-gray-300 dark:bg-slate-600 rounded" />
        <div className="h-5 w-10 bg-gray-300 dark:bg-slate-600 rounded" />
      </div>
      <div className="size-6 rounded-full bg-gray-300 dark:bg-slate-600" />
    </div>
  </div>
);

export const SkeletonColumn: React.FC<{ cardCount?: number }> = ({ cardCount = 3 }) => (
  <div className="flex flex-col w-80 max-h-full bg-gray-100 dark:bg-dark-surface/50 rounded-xl border border-gray-200 dark:border-dark-border/50">
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`h-4 w-24 rounded ${shimmer}`} />
        <div className={`h-5 w-6 rounded-full ${shimmer}`} />
      </div>
    </div>
    <div className="p-3 flex-1 flex flex-col gap-3">
      {Array.from({ length: cardCount }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

export const SkeletonBoard: React.FC = () => (
  <div className="flex flex-col h-full overflow-hidden">
    <div className="px-6 pb-4 space-y-2 shrink-0">
      <div className={`h-7 w-48 rounded ${shimmer}`} />
      <div className={`h-4 w-96 rounded ${shimmer}`} />
    </div>
    <div className="flex-1 overflow-hidden pb-2 px-6">
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
  <div className="px-6 pb-20 overflow-hidden flex flex-col h-full">
    <div className="flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg shadow-sm">
      <div className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface p-4">
        <div className={`h-4 w-full rounded ${shimmer}`} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-100 dark:border-dark-border">
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
  <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`size-10 rounded-lg ${shimmer}`} />
    </div>
    <div className={`h-4 w-24 rounded ${shimmer} mb-2`} />
    <div className={`h-8 w-16 rounded ${shimmer}`} />
  </div>
);

export const SkeletonReports: React.FC = () => (
  <div className="px-6 pb-12 space-y-6 h-full">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SkeletonMetric />
      <SkeletonMetric />
      <SkeletonMetric />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
        <div className={`h-6 w-48 rounded ${shimmer} mb-6`} />
        <div className={`h-[300px] rounded ${shimmer}`} />
      </div>
      <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
        <div className={`h-6 w-36 rounded ${shimmer} mb-6`} />
        <div className={`h-[220px] rounded ${shimmer}`} />
      </div>
    </div>
  </div>
);
