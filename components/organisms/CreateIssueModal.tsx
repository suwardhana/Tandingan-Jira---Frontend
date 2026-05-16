import React, { useRef, useState, useEffect } from "react";
import { Priority, Status, IssueType, User, Task, Sprint } from "../../types";
import MarkdownEditor from "../molecules/MarkdownEditor";

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Partial<Task>) => void;
  users: User[];
  sprints: Sprint[];
  currentSprintId: string;
}

const typeConfig: Record<string, { icon: string; color: string; border: string; bg: string; label: string }> = {
  [IssueType.TASK]: {
    icon: "check_box",
    color: "text-blue-500",
    border: "border-blue-500",
    bg: "bg-blue-500/10",
    label: "Task",
  },
  [IssueType.BUG]: {
    icon: "bug_report",
    color: "text-red-500",
    border: "border-red-500",
    bg: "bg-red-500/10",
    label: "Bug",
  },
};

const CreateIssueModal: React.FC<CreateIssueModalProps> = React.memo(
  ({ isOpen, onClose, onCreate, users, sprints, currentSprintId }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<IssueType>(IssueType.TASK);
    const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
    const [assigneeId, setAssigneeId] = useState<string>("");
    const [sprintId, setSprintId] = useState<string>(currentSprintId);
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isOpen) {
        setTimeout(() => titleRef.current?.focus(), 100);
      }
    }, [isOpen]);

    if (!isOpen) return null;

    const resetForm = () => {
      setTitle("");
      setDescription("");
      setType(IssueType.TASK);
      setPriority(Priority.MEDIUM);
      setAssigneeId("");
      setSprintId(currentSprintId);
    };

    const handleClose = () => {
      resetForm();
      onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onCreate({
        title,
        description,
        type,
        priority,
        assigneeId: assigneeId || undefined,
        sprintId,
        status: Status.TODO,
        reporterId: users[0].id,
        labels: [],
      });
      resetForm();
      onClose();
    };

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center sm:p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        ></div>
        <div className="relative flex h-full max-h-full w-full animate-[fadeIn_0.2s_ease-out] flex-col overflow-hidden border-gray-200 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-surface sm:max-h-[90vh] sm:max-w-lg sm:rounded-xl sm:border">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-border">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Issue</h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-6">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Issue Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(IssueType).map((t) => {
                  const config = typeConfig[t];
                  const isSelected = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                        isSelected
                          ? `${config.border} ${config.bg} text-slate-900 dark:text-white`
                          : "border-gray-200 bg-gray-50 text-slate-500 hover:border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-slate-400 dark:hover:border-slate-600"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-lg ${isSelected ? config.color : "text-slate-400"}`}
                      >
                        {config.icon}
                      </span>
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Summary <span className="text-red-500">*</span>
              </label>
              <input
                ref={titleRef}
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 dark:border-dark-border dark:bg-dark-bg dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Description
              </label>
              <MarkdownEditor
                value={description}
                onChange={setDescription}
                placeholder="Add a detailed description..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-slate-900 dark:border-dark-border dark:bg-dark-bg dark:text-white"
                >
                  {Object.values(Priority).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-slate-900 dark:border-dark-border dark:bg-dark-bg dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Sprint
              </label>
              <select
                value={sprintId}
                onChange={(e) => setSprintId(e.target.value)}
                className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-slate-900 dark:border-dark-border dark:bg-dark-bg dark:text-white"
              >
                {sprints.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-jira-blue px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-jira-blue-hover"
              >
                Create Issue
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  },
);

export default CreateIssueModal;
