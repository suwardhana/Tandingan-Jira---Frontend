import React, { useState, useRef, useEffect } from "react";
import { Task, User, Priority, Status, IssueType } from "../../types";
import { renderMarkdown } from "../../utils/markdown";
import Avatar from "../atoms/Avatar";
import PriorityIcon from "../atoms/PriorityIcon";
import MarkdownEditor from "../molecules/MarkdownEditor";

interface IssueModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onAddComment: (taskId: string, text: string) => void;
  onAddSubtask?: (taskId: string, title: string) => void;
  onDeleteSubtask?: (subtaskId: string) => void;
  onToggleSubtask?: (subtaskId: string, completed: boolean) => void;
}

const IssueModal: React.FC<IssueModalProps> = React.memo(
  ({
    task,
    isOpen,
    onClose,
    users,
    onUpdateTask,
    onAddComment,
    onAddSubtask,
    onDeleteSubtask,
    onToggleSubtask,
  }) => {
    const [newComment, setNewComment] = useState("");
    const [activeTab, setActiveTab] = useState<"comments" | "history">("comments");
    const [isLabelInputVisible, setIsLabelInputVisible] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
    const [isSubtaskInputVisible, setIsSubtaskInputVisible] = useState(false);
    const [newSubtask, setNewSubtask] = useState("");
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editDescription, setEditDescription] = useState("");
    const labelInputRef = useRef<HTMLInputElement>(null);
    const typePickerRef = useRef<HTMLDivElement>(null);
    const subtaskInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isLabelInputVisible && labelInputRef.current) {
        labelInputRef.current.focus();
      }
    }, [isLabelInputVisible]);

    useEffect(() => {
      if (isSubtaskInputVisible && subtaskInputRef.current) {
        subtaskInputRef.current.focus();
      }
    }, [isSubtaskInputVisible]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (typePickerRef.current && !typePickerRef.current.contains(event.target as Node)) {
          setIsTypePickerOpen(false);
        }
      };
      if (isTypePickerOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isTypePickerOpen]);

    if (!isOpen || !task) return null;

    const assignee = users.find((u) => u.id === task.assigneeId);
    const currentUser = users[0];

    const handleCommentSubmit = () => {
      if (!newComment.trim()) return;
      onAddComment(task.id, newComment);
      setNewComment("");
    };

    const handleAddLabel = () => {
      const labels = task.labels || [];
      if (newLabel.trim() && !labels.includes(newLabel.trim())) {
        onUpdateTask(task.id, { labels: [...labels, newLabel.trim()] });
      }
      setNewLabel("");
      setIsLabelInputVisible(false);
    };

    const handleRemoveLabel = (label: string) => {
      const labels = task.labels || [];
      onUpdateTask(task.id, { labels: labels.filter((l) => l !== label) });
    };

    const handleAddSubtask = () => {
      if (!newSubtask.trim()) return;
      if (onAddSubtask) {
        onAddSubtask(task.id, newSubtask.trim());
      }
      setNewSubtask("");
      setIsSubtaskInputVisible(false);
    };

    const handleDeleteSubtask = (subtaskId: string) => {
      if (onDeleteSubtask) {
        onDeleteSubtask(subtaskId);
      }
    };

    const handleToggleSubtask = (subtaskId: string, completed: boolean) => {
      if (onToggleSubtask) {
        onToggleSubtask(subtaskId, completed);
      }
    };

    const formatDateForInput = (dateString?: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!val) {
        onUpdateTask(task.id, { dueDate: undefined });
        return;
      }
      const dateObj = new Date(val);
      const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(dateObj.getTime() + userTimezoneOffset);
      const formatted = adjustedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      onUpdateTask(task.id, { dueDate: formatted });
    };

    const dummyHistory = [
      {
        id: "h1",
        action: "changed status to In Progress",
        user: "Jane Doe",
        time: "2 hours ago",
      },
      {
        id: "h2",
        action: "updated the description",
        user: "Mike Chen",
        time: "5 hours ago",
      },
      {
        id: "h3",
        action: "created this issue",
        user: "Jane Doe",
        time: "Yesterday",
      },
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
        <div className="relative flex h-full max-h-full w-full animate-[fadeIn_0.2s_ease-out] flex-col overflow-hidden bg-white shadow-2xl dark:bg-dark-surface sm:max-h-[90vh] sm:max-w-4xl sm:rounded-xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-border">
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <div className="relative" ref={typePickerRef}>
                <button
                  onClick={() => setIsTypePickerOpen(!isTypePickerOpen)}
                  className="flex items-center justify-center rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Change issue type"
                >
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      task.type === IssueType.BUG ? "text-red-500" : "text-blue-500"
                    }`}
                  >
                    {task.type === IssueType.BUG ? "bug_report" : "check_box"}
                  </span>
                </button>

                {isTypePickerOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-40 animate-[fadeIn_0.1s_ease-out] rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-dark-border dark:bg-dark-surface">
                    <div className="mb-1 border-b border-gray-100 px-3 py-2 text-xs font-bold uppercase text-slate-400 dark:border-dark-border">
                      Change Type
                    </div>
                    {Object.values(IssueType).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          onUpdateTask(task.id, { type });
                          setIsTypePickerOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 ${
                          task.type === type
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            type === IssueType.BUG ? "text-red-500" : "text-blue-500"
                          }`}
                        >
                          {type === IssueType.BUG ? "bug_report" : "check_box"}
                        </span>
                        <span>{type}</span>
                        {task.type === type && (
                          <span className="material-symbols-outlined ml-auto text-[16px]">
                            check
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="cursor-pointer text-base font-medium hover:underline">
                {task.key}
              </span>
            </div>

            {/* Status breadcrumb */}
            <div className="flex items-center gap-0">
              {[Status.TODO, Status.IN_PROGRESS, Status.REVIEW, Status.DONE].map(
                (s, i) => {
                  const statusOrder = [
                    Status.TODO,
                    Status.IN_PROGRESS,
                    Status.REVIEW,
                    Status.DONE,
                  ];
                  const currentIdx = statusOrder.indexOf(task.status);
                  const stepIdx = statusOrder.indexOf(s);
                  const isCompleted = stepIdx <= currentIdx;
                  const isDone = task.status === Status.DONE;

                  return (
                    <React.Fragment key={s}>
                      {i > 0 && (
                        <div
                          className={`mx-0.5 h-px w-4 ${
                            stepIdx <= currentIdx
                              ? isDone
                                ? "bg-green-500"
                                : "bg-blue-500"
                              : "bg-gray-300 dark:bg-slate-600"
                          }`}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          // Clicking the current step unchecks (moves to previous), except To Do
                          if (s === task.status && s !== Status.TODO) {
                            const prev = statusOrder[stepIdx - 1];
                            onUpdateTask(task.id, { status: prev });
                          } else {
                            onUpdateTask(task.id, { status: s });
                          }
                        }}
                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-all ${
                          isCompleted
                            ? isDone
                              ? "text-green-600 dark:text-green-400"
                              : "text-blue-600 dark:text-blue-400"
                            : "text-slate-400 dark:text-slate-500"
                        } hover:bg-gray-100 dark:hover:bg-slate-700/50`}
                        title={s}
                      >
                        <span
                          className={`material-symbols-outlined text-[16px] ${
                            isCompleted ? "fill-icon" : ""
                          }`}
                        >
                          {isCompleted ? "check_circle" : "circle"}
                        </span>
                        <span className="hidden sm:inline">{s}</span>
                      </button>
                    </React.Fragment>
                  );
                },
              )}
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700/50 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <div className="grid min-h-full grid-cols-1 lg:grid-cols-12">
              {/* Main Content */}
              <div className="space-y-8 border-b border-gray-200 p-6 dark:border-dark-border lg:col-span-8 lg:border-b-0 lg:border-r">
                <div>
                  <div className="group relative">
                    <input
                      value={task.title}
                      onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
                      className="-ml-2 mb-6 w-full rounded border border-transparent bg-transparent p-2 text-2xl font-bold leading-tight text-slate-900 transition-all hover:border-gray-200 hover:bg-gray-100 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:text-white dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:focus:bg-dark-bg"
                    />
                    <span className="material-symbols-outlined pointer-events-none absolute right-2 top-3 text-slate-400 opacity-0 group-hover:opacity-100">
                      edit
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Description
                    </h3>

                    {isEditingDescription ? (
                      <MarkdownEditor
                        value={editDescription}
                        onChange={setEditDescription}
                        placeholder="Add a detailed description..."
                        rows={10}
                        headerRight={
                          <>
                            <button
                              type="button"
                              onClick={() => setIsEditingDescription(false)}
                              className="rounded px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateTask(task.id, { description: editDescription });
                                setIsEditingDescription(false);
                              }}
                              className="rounded bg-jira-blue px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-jira-blue-hover"
                            >
                              Save
                            </button>
                          </>
                        }
                      />
                    ) : (
                      <div className="group relative min-h-[80px] rounded-lg p-4 transition-all dark:border-dark-border">
                        {task.description ? (
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none text-sm"
                            dangerouslySetInnerHTML={{
                              __html: renderMarkdown(task.description),
                            }}
                          />
                        ) : (
                          <p className="text-sm text-slate-400 dark:text-slate-500">
                            Add a detailed description...
                          </p>
                        )}
                        <button
                          type="button"
                          className="absolute right-3 top-3 rounded-md bg-white px-2.5 py-1 text-xs font-medium text-slate-600 opacity-0 shadow-sm ring-1 ring-gray-300 transition-all hover:bg-gray-50 group-hover:opacity-100 dark:bg-dark-surface dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-slate-700"
                          onClick={() => {
                            setEditDescription(task.description || "");
                            setIsEditingDescription(true);
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtasks Section - Always visible */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Subtasks
                    </h3>
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {task.subtasks.filter((s) => s.completed).length} of{" "}
                          {task.subtasks.length}
                        </span>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{
                              width: `${
                                (task.subtasks.filter((s) => s.completed).length /
                                  task.subtasks.length) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {task.subtasks?.map((sub) => (
                      <div
                        key={sub.id}
                        className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <input
                          type="checkbox"
                          checked={sub.completed}
                          onChange={(e) => handleToggleSubtask(sub.id, e.target.checked)}
                          className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span
                          className={`flex-1 text-sm ${
                            sub.completed
                              ? "text-slate-400 line-through"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {sub.title}
                        </span>
                        <button
                          onClick={() => handleDeleteSubtask(sub.id)}
                          className="rounded p-1 opacity-0 transition-all hover:bg-red-50 group-hover:opacity-100 dark:hover:bg-red-900/20"
                          title="Delete subtask"
                        >
                          <span className="material-symbols-outlined text-[18px] text-red-500">
                            delete
                          </span>
                        </button>
                      </div>
                    ))}

                    {/* Add Subtask Input */}
                    {isSubtaskInputVisible ? (
                      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-900/10">
                        <span className="material-symbols-outlined text-[20px] text-slate-400">
                          add_circle
                        </span>
                        <input
                          ref={subtaskInputRef}
                          type="text"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddSubtask();
                            if (e.key === "Escape") {
                              setIsSubtaskInputVisible(false);
                              setNewSubtask("");
                            }
                          }}
                          onBlur={() => {
                            if (!newSubtask.trim()) {
                              setIsSubtaskInputVisible(false);
                            }
                          }}
                          className="flex-1 border-none bg-transparent p-0 text-sm text-slate-700 focus:ring-0 dark:text-slate-200"
                          placeholder="Type subtask title and press Enter..."
                        />
                        <button
                          onClick={handleAddSubtask}
                          disabled={!newSubtask.trim()}
                          className="text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[20px]">check</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsSubtaskInputVisible(true)}
                        className="flex items-center gap-2 rounded-lg p-2 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-blue-400"
                      >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Add subtask</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Attachments
                  </h3>
                  <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:bg-slate-50 dark:border-dark-border dark:hover:bg-slate-800/30">
                    <span className="material-symbols-outlined mb-2 text-3xl text-slate-400">
                      cloud_upload
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Drop files to attach, or{" "}
                      <span className="font-medium text-blue-500">browse</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4 border-t border-gray-200 pt-6 dark:border-dark-border">
                  <div className="flex gap-6 border-b border-gray-200 dark:border-dark-border">
                    <button
                      onClick={() => setActiveTab("comments")}
                      className={`border-b-2 pb-2 text-sm font-semibold transition-colors ${
                        activeTab === "comments"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      Comments
                    </button>
                    <button
                      onClick={() => setActiveTab("history")}
                      className={`border-b-2 pb-2 text-sm font-semibold transition-colors ${
                        activeTab === "history"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      History
                    </button>
                  </div>

                  {activeTab === "comments" ? (
                    <>
                      <div className="mb-6 space-y-4">
                        {task.comments?.map((comment) => {
                          const commentUser = users.find((u) => u.id === comment.userId);
                          return (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar
                                src={commentUser?.avatar}
                                name={commentUser?.name}
                                size="lg"
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                                    {commentUser?.name}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {comment.createdAt}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  {comment.text}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-3">
                        <Avatar src={currentUser.avatar} name={currentUser.name} size="lg" />
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-dark-border dark:bg-dark-bg dark:text-white"
                            rows={2}
                            placeholder="Add a comment..."
                          ></textarea>
                          <div className="mt-2 flex justify-end gap-2">
                            <button
                              onClick={handleCommentSubmit}
                              disabled={!newComment.trim()}
                              className="rounded bg-jira-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-jira-blue-hover disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      {dummyHistory.map((item) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className="mt-1 size-2 rounded-full bg-gray-300 dark:bg-slate-600"></div>
                          <div className="text-sm">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {item.user}
                            </span>{" "}
                            <span className="text-slate-600 dark:text-slate-300">
                              {item.action}
                            </span>
                            <p className="mt-0.5 text-xs text-slate-400">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6 bg-gray-50/50 p-6 dark:bg-dark-bg/20 lg:col-span-4">
                <div className="space-y-4">
                  <h3 className="border-b border-gray-200 pb-2 text-sm font-bold text-slate-900 dark:border-dark-border dark:text-white">
                    Details
                  </h3>

                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Assignee</span>
                    <div className="relative">
                      <select
                        value={task.assigneeId || ""}
                        onChange={(e) =>
                          onUpdateTask(task.id, {
                            assigneeId: e.target.value || undefined,
                          })
                        }
                        className="w-full cursor-pointer appearance-none rounded-md border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-dark-border dark:bg-dark-surface dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                      {assignee ? (
                        <Avatar
                          src={assignee.avatar}
                          name={assignee.name}
                          size="sm"
                          className="pointer-events-none absolute left-2.5 top-2"
                        />
                      ) : (
                        <span className="material-symbols-outlined pointer-events-none absolute left-2 top-2 text-lg text-slate-400">
                          person
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Priority</span>
                    <div className="relative">
                      <select
                        value={task.priority}
                        onChange={(e) =>
                          onUpdateTask(task.id, {
                            priority: e.target.value as Priority,
                          })
                        }
                        className="w-full cursor-pointer appearance-none rounded-md border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-dark-border dark:bg-dark-surface dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        {Object.values(Priority).map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute left-2 top-2">
                        <PriorityIcon priority={task.priority} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Due Date</span>
                    <input
                      type="date"
                      value={formatDateForInput(task.dueDate)}
                      onChange={handleDateChange}
                      className="w-full rounded-md border-transparent bg-transparent py-1 text-sm text-slate-700 hover:bg-slate-200/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-700/50"
                    />
                  </div>

                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Created</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {task.createdAt}
                    </span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Updated</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {task.updatedAt}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Labels
                    </label>
                    {!isLabelInputVisible && (
                      <button
                        onClick={() => setIsLabelInputVisible(true)}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Add
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(task.labels || []).map((l) => (
                      <span
                        key={l}
                        className="group relative flex items-center gap-1 rounded border border-gray-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-gray-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {l}
                        <button
                          onClick={() => handleRemoveLabel(l)}
                          className="hidden hover:text-red-500 group-hover:block"
                        >
                          <span className="material-symbols-outlined text-[10px] font-bold">
                            close
                          </span>
                        </button>
                      </span>
                    ))}

                    {isLabelInputVisible ? (
                      <input
                        ref={labelInputRef}
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddLabel();
                          if (e.key === "Escape") setIsLabelInputVisible(false);
                        }}
                        onBlur={() => {
                          if (!newLabel) setIsLabelInputVisible(false);
                        }}
                        className="w-24 rounded border border-blue-500 bg-white px-2 py-1 text-xs text-slate-900 focus:ring-1 focus:ring-blue-500 dark:bg-dark-bg dark:text-white"
                        placeholder="Type & Enter"
                      />
                    ) : (
                      <button
                        onClick={() => setIsLabelInputVisible(true)}
                        className="flex items-center rounded border border-dashed border-gray-300 px-2 py-1 text-xs text-slate-400 hover:border-blue-500 hover:text-blue-500 dark:border-gray-600"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default IssueModal;
