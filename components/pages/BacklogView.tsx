import React, { useState, useMemo } from "react";
import { Task, Sprint, User, IssueType, Status } from "../../types";
import PriorityIcon from "../atoms/PriorityIcon";
import Avatar from "../atoms/Avatar";

interface BacklogViewProps {
  tasks: Task[];
  sprints: Sprint[];
  users: User[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onStartSprint: (sprintId: string) => void;
  onCompleteSprint: (sprintId: string) => void;
  searchQuery: string;
  onCreateForSprint: (sprintId?: string) => void;
  onQuickCreate: (title: string, sprintId?: string) => void;
}

const typeIcons: Record<string, string> = {
  [IssueType.TASK]: "check_box",
  [IssueType.BUG]: "bug_report",
};

const typeColors: Record<string, string> = {
  [IssueType.TASK]: "text-blue-500",
  [IssueType.BUG]: "text-red-500",
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-700 dark:text-green-400" },
  future: { bg: "bg-blue-100 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400" },
  closed: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-500 dark:text-slate-400" },
};

const BacklogView: React.FC<BacklogViewProps> = React.memo(
  ({ tasks, sprints, users, onTaskClick, onTaskUpdate: _onTaskUpdate, onStartSprint, onCompleteSprint, searchQuery, onCreateForSprint: _onCreateForSprint, onQuickCreate }) => {
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

    const toggleSection = (key: string) => {
      setCollapsedSections((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    };

    const filteredTasks = useMemo(() => {
      if (!searchQuery) return tasks;
      const q = searchQuery.toLowerCase();
      return tasks.filter(
        (t) => t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q),
      );
    }, [tasks, searchQuery]);

    const { backlogTasks, sprintGroups } = useMemo(() => {
      const backlog: Task[] = [];
      const groups: { sprint: Sprint; tasks: Task[] }[] = [];

      for (const sprint of sprints) {
        const sprintTasks = filteredTasks.filter((t) => t.sprintId === sprint.id);
        groups.push({ sprint, tasks: sprintTasks });
      }

      const sprintedIds = new Set(groups.flatMap((g) => g.tasks.map((t) => t.id)));
      for (const t of filteredTasks) {
        if (!sprintedIds.has(t.id)) {
          backlog.push(t);
        }
      }

      return { backlogTasks: backlog, sprintGroups: groups };
    }, [filteredTasks, sprints]);

    const getUserById = (id?: string) => users.find((u) => u.id === id);

    const InlineCreateInput: React.FC<{ placeholder: string; onSubmit: (title: string) => void }> =
      React.memo(({ placeholder, onSubmit }) => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState("");
        const inputRef = React.useRef<HTMLInputElement>(null);

        const expand = () => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        };

        const collapse = () => {
          setOpen(false);
          setValue("");
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter" && value.trim()) {
            e.preventDefault();
            onSubmit(value.trim());
            collapse();
          } else if (e.key === "Escape") {
            collapse();
          }
        };

        if (!open) {
          return (
            <button
              onClick={expand}
              className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-gray-50 hover:text-jira-blue dark:border-dark-border dark:hover:bg-slate-800/50 dark:hover:text-jira-blue"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create issue
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-1.5 dark:border-dark-border">
            <span className="material-symbols-outlined shrink-0 text-[18px] text-slate-300 dark:text-slate-600">
              add
            </span>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => { if (!value) collapse(); }}
              placeholder={placeholder}
              className="w-full border-none bg-transparent py-1.5 text-sm text-slate-800 placeholder-slate-400 outline-none dark:text-white dark:placeholder-slate-500"
            />
          </div>
        );
      });

    const renderTaskRow = (task: Task) => {
      const assignee = getUserById(task.assigneeId);
      return (
        <div
          key={task.id}
          onClick={() => onTaskClick(task)}
          className="group flex cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-2.5 transition-colors hover:bg-gray-50 dark:border-dark-border dark:hover:bg-slate-800/50"
        >
          {/* Type icon */}
          <span className={`material-symbols-outlined shrink-0 text-[16px] ${typeColors[task.type] || typeColors[IssueType.TASK]}`}>
            {typeIcons[task.type] || typeIcons[IssueType.TASK]}
          </span>

          {/* Key + title */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-xs font-medium text-slate-400">{task.key}</span>
              <span className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {task.title}
              </span>
            </div>
          </div>

          {/* Priority */}
          <PriorityIcon priority={task.priority} size="sm" />

          {/* Status */}
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-medium capitalize ${
              task.status === Status.TODO
                ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                : task.status === Status.IN_PROGRESS
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : task.status === Status.REVIEW
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            }`}
          >
            {task.status}
          </span>

          {/* Assignee */}
          <div className="shrink-0" title={assignee?.name || "Unassigned"}>
            <Avatar
              src={assignee?.avatar}
              name={assignee?.name}
              size="sm"
              className="ring-1 ring-white dark:ring-slate-800"
            />
          </div>
        </div>
      );
    };

    const renderSprintSection = (sprint: Sprint, sectionTasks: Task[]) => {
      const key = sprint.id;
      const collapsed = collapsedSections.has(key);
      const totalTasks = sectionTasks.length;
      const doneTasks = sectionTasks.filter(
        (t) => t.status === Status.DONE,
      ).length;

      return (
        <div key={key} className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-dark-border dark:bg-dark-surface">
          {/* Sprint header */}
          <button
            onClick={() => toggleSection(key)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/30"
          >
            <span className={`material-symbols-outlined text-lg text-slate-400 transition-transform ${collapsed ? "" : "rotate-90"}`}>
              chevron_right
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {sprint.name}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-medium capitalize ${statusConfig[sprint.status]?.bg || ""} ${statusConfig[sprint.status]?.text || ""}`}
                >
                  {sprint.status}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                <span>
                  {sprint.startDate} {sprint.endDate ? `— ${sprint.endDate}` : ""}
                </span>
                <span>
                  {doneTasks}/{totalTasks} done
                </span>
              </div>
            </div>

            {/* Sprint actions */}
            <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {sprint.status === "future" && (
                <button
                  onClick={() => onStartSprint(sprint.id)}
                  className="flex items-center gap-1 rounded-md bg-jira-blue px-2.5 py-1 text-2xs font-semibold text-white transition-colors hover:bg-jira-blue-hover"
                >
                  <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                  Start
                </button>
              )}
              {sprint.status === "active" && (
                <button
                  onClick={() => onCompleteSprint(sprint.id)}
                  className="flex items-center gap-1 rounded-md bg-jira-green px-2.5 py-1 text-2xs font-semibold text-white transition-colors hover:bg-green-600"
                >
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  Complete
                </button>
              )}
            </div>
          </button>

          {/* Sprint goal */}
          {sprint.goal && !collapsed && (
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 dark:border-dark-border dark:bg-slate-800/20">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold">Goal:</span> {sprint.goal}
              </p>
            </div>
          )}

          {/* Task list */}
          {!collapsed && (
            <div className="border-t border-gray-100 dark:border-dark-border">
              {sectionTasks.length > 0 ? (
                sectionTasks.map(renderTaskRow)
              ) : (
                <p className="px-4 py-3 text-xs text-slate-400">No tasks in this sprint</p>
              )}
              <InlineCreateInput
                placeholder="What needs to be done?"
                onSubmit={(title) => onQuickCreate(title, sprint.id)}
              />
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="mx-auto flex h-full max-w-4xl flex-col gap-6 px-4 py-4 sm:px-6">
        {/* Backlog section */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-dark-border dark:bg-dark-surface">
          <button
            onClick={() => toggleSection("backlog")}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/30"
          >
            <span className={`material-symbols-outlined text-lg text-slate-400 transition-transform ${collapsedSections.has("backlog") ? "" : "rotate-90"}`}>
              chevron_right
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Backlog
              </h3>
              <p className="text-xs text-slate-400">
                {backlogTasks.length} issue{backlogTasks.length !== 1 ? "s" : ""} not assigned to a sprint
              </p>
            </div>
          </button>
          {!collapsedSections.has("backlog") && (
            <div className="border-t border-gray-100 dark:border-dark-border">
              {backlogTasks.length > 0 ? (
                backlogTasks.map(renderTaskRow)
              ) : (
                <p className="px-4 py-3 text-xs text-slate-400">Backlog is empty — no unscheduled issues.</p>
              )}
              <InlineCreateInput
                placeholder="What needs to be done?"
                onSubmit={(title) => onQuickCreate(title, undefined)}
              />
            </div>
          )}
        </div>

        {/* Sprint sections */}
        {sprintGroups.map(({ sprint, tasks: sectionTasks }) =>
          renderSprintSection(sprint, sectionTasks),
        )}

        {sprints.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
            <span className="material-symbols-outlined text-3xl">inventory_2</span>
            <p className="text-sm">No sprints yet. Create a sprint from the Board view.</p>
          </div>
        )}
      </div>
    );
  },
);

export default BacklogView;
