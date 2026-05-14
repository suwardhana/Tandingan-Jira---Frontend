import React, { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Task, Status, Sprint, User } from "../../types";
import TaskCard from "../molecules/TaskCard";

// ── Board view props ──────────────────────────────────────────────────────

interface BoardViewProps {
  tasks: Task[];
  sprint: Sprint;
  users: User[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onReorder: (status: Status, orderedTaskIds: string[]) => void;
  onStartSprint: (sprintId: string) => void;
  onCompleteSprint: (sprintId: string) => void;
  filterAssigneeId: string | null;
  onFilterAssignee: (id: string | null) => void;
  showMyTasksOnly: boolean;
  onToggleMyTasks: () => void;
}

// ── Sortable card wrapper ─────────────────────────────────────────────────

interface SortableCardProps {
  task: Task;
  assignee?: User;
  onClick: (task: Task) => void;
}

const SortableCard: React.FC<SortableCardProps> = React.memo(({ task, assignee, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task, status: task.status },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? "opacity-30" : ""}
    >
      <TaskCard task={task} assignee={assignee} onClick={onClick} />
    </div>
  );
});

// ── Droppable column wrapper ──────────────────────────────────────────────

interface DroppableColumnProps {
  status: Status;
  children: React.ReactNode;
  taskCount: number;
  isEmpty: boolean;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  status,
  children,
  taskCount,
  isEmpty,
}) => {
  const { isOver, setNodeRef } = useDroppable({ id: status, data: { status } });

  return (
    <div
      ref={setNodeRef}
      className={`flex max-h-full w-[85vw] flex-none snap-center flex-col rounded-lg transition-colors sm:w-72 ${
        isOver
          ? "bg-blue-50 ring-2 ring-inset ring-jira-blue dark:bg-blue-900/20"
          : "bg-gray-100 dark:bg-slate-800/60"
      }`}
    >
      <div className="sticky top-0 z-10 flex items-center gap-2 rounded-t-lg bg-inherit px-3 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-primary dark:text-slate-200">
          {status}
        </h3>
        <span className="min-w-[20px] rounded-full bg-gray-200 px-1.5 py-0.5 text-center text-xs font-bold text-text-secondary dark:bg-slate-700 dark:text-slate-400">
          {taskCount}
        </span>
      </div>

      <div className="custom-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {children}
        {/* Empty column drop target */}
        {isEmpty && (
          <div className="mb-1 flex min-h-[80px] flex-1 items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-4 text-center transition-colors dark:border-slate-600">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              {status === Status.TODO && "Plan what's coming up — drop a task to get started"}
              {status === Status.IN_PROGRESS && "Got something to tackle? Drag it here and dive in"}
              {status === Status.REVIEW && "Ship with confidence — give it a final look first"}
              {status === Status.DONE && "The sweet spot. Ready to wrap something up?"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Board view ────────────────────────────────────────────────────────────

const BoardView: React.FC<BoardViewProps> = ({
  tasks,
  sprint,
  users,
  onTaskClick,
  onTaskUpdate,
  onReorder,
  onStartSprint,
  onCompleteSprint,
  filterAssigneeId,
  onFilterAssignee,
  showMyTasksOnly,
  onToggleMyTasks,
}) => {
  const columns = Object.values(Status);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const getTasksByStatus = useCallback(
    (status: Status) =>
      tasks.filter((t) => t.status === status).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [tasks],
  );

  const getUser = (id?: string) => users.find((u) => u.id === id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    // Dropped directly on a column droppable
    const droppedOnColumn = Object.values(Status).includes(over.id as Status);
    if (droppedOnColumn) {
      const newStatus = over.id as Status;
      if (newStatus !== task.status) {
        onTaskUpdate(task.id, { status: newStatus });
      }
      return;
    }

    // Dropped on another card
    const overTask = tasks.find((t) => t.id === over.id);
    if (!overTask) return;
    if (task.id === overTask.id) return;

    if (task.status === overTask.status) {
      // Same column — reorder
      const columnTasks = getTasksByStatus(task.status);
      const oldIndex = columnTasks.findIndex((t) => t.id === task.id);
      const newIndex = columnTasks.findIndex((t) => t.id === overTask.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(columnTasks, oldIndex, newIndex);
      onReorder(
        task.status,
        reordered.map((t) => t.id),
      );
    } else {
      // Different column — insert at the over card's position
      const targetColumnTasks = getTasksByStatus(overTask.status);
      const insertIndex = targetColumnTasks.findIndex((t) => t.id === overTask.id);
      const newOrder = insertIndex + 1;
      onTaskUpdate(task.id, { status: overTask.status, order: newOrder });
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  // ── Sprint progress ────────────────────────────────────────────────────
  const parseDate = (d: string) => {
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const startDate = parseDate(sprint.startDate);
  const endDate = parseDate(sprint.endDate);
  const now = new Date();

  let progressPct = 0;
  let progressLabel = "";
  if (sprint.status === "closed") {
    progressPct = 100;
    progressLabel = "Completed";
  } else if (sprint.status === "future") {
    progressPct = 0;
    progressLabel = startDate ? `Starts ${sprint.startDate}` : "Upcoming";
  } else if (startDate && endDate) {
    const total = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    progressPct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
    const totalDays = Math.ceil(total / (1000 * 60 * 60 * 24));
    const dayNum = Math.min(totalDays, Math.max(1, Math.ceil(elapsed / (1000 * 60 * 60 * 24))));
    progressLabel = `Day ${dayNum} of ${totalDays}`;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Sprint Header */}
      <div className="shrink-0 space-y-3 px-3 pb-1 pt-2 sm:px-6 sm:pt-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h2 className="text-lg font-bold text-text-primary dark:text-white sm:text-xl">
                {sprint.name}
              </h2>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                  sprint.status === "active"
                    ? "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    : sprint.status === "closed"
                      ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {sprint.status}
              </span>
              <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:inline">
                {sprint.startDate} - {sprint.endDate}
              </span>
            </div>
            {sprint.goal && (
              <p className="mt-1 max-w-2xl truncate text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                {sprint.goal}
              </p>
            )}

            {/* Progress bar */}
            <div className="mt-2 flex max-w-md items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    sprint.status === "closed"
                      ? "bg-emerald-500"
                      : progressPct > 80
                        ? "bg-amber-500"
                        : "bg-jira-blue"
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
                {progressLabel}
              </span>
            </div>
          </div>

          {/* Sprint actions */}
          <div className="flex shrink-0 items-center gap-2">
            {sprint.status === "future" && (
              <button
                onClick={() => onStartSprint(sprint.id)}
                className="flex items-center gap-1.5 rounded-lg bg-jira-blue px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-jira-blue-hover active:scale-95"
              >
                <span className="material-symbols-outlined text-base">play_arrow</span>
                Start Sprint
              </button>
            )}
            {sprint.status === "active" && (
              <button
                onClick={() => onCompleteSprint(sprint.id)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition-all hover:border-emerald-300 hover:text-emerald-700 dark:border-dark-border dark:bg-dark-surface dark:text-slate-300 dark:hover:border-emerald-600 dark:hover:text-emerald-400"
              >
                <span className="material-symbols-outlined text-base">check</span>
                Complete Sprint
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 border-t border-gray-200 pt-2 dark:border-dark-border">
          <span className="mr-1 text-xs font-medium text-slate-400 dark:text-slate-500">Filter</span>
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() =>
                onFilterAssignee(filterAssigneeId === u.id ? null : u.id)
              }
              className={`shrink-0 rounded-full transition-all hover:ring-2 hover:ring-jira-blue/50 ${
                filterAssigneeId === u.id ? "ring-2 ring-jira-blue" : "opacity-60 hover:opacity-100"
              }`}
              title={u.name}
            >
              <img
                src={u.avatar}
                alt={u.name}
                className="size-7 rounded-full border-2 border-white dark:border-dark-bg"
              />
            </button>
          ))}
          <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-slate-700" />
          <button
            onClick={onToggleMyTasks}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              showMyTasksOnly
                ? "border-jira-blue bg-blue-50 text-jira-blue dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 text-slate-500 hover:border-gray-300 dark:border-dark-border dark:text-slate-400 dark:hover:border-slate-500"
            }`}
          >
            <span className="material-symbols-outlined text-sm">person</span>
            Mine
          </button>
          {(filterAssigneeId || showMyTasksOnly) && (
            <button
              onClick={() => {
                onFilterAssignee(null);
                if (showMyTasksOnly) onToggleMyTasks();
              }}
              className="ml-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Board Columns with Sortable DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-3 pb-2 sm:px-6">
          <div className="flex h-full min-w-max snap-x gap-3 sm:gap-4">
            {columns.map((status) => {
              const columnTasks = getTasksByStatus(status);
              const taskIds = columnTasks.map((t) => t.id);

              return (
                <DroppableColumn
                  key={status}
                  status={status}
                  taskCount={columnTasks.length}
                  isEmpty={columnTasks.length === 0}
                >
                  <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {columnTasks.map((task) => (
                      <SortableCard
                        key={task.id}
                        task={task}
                        assignee={getUser(task.assigneeId)}
                        onClick={onTaskClick}
                      />
                    ))}
                  </SortableContext>
                </DroppableColumn>
              );
            })}
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "ease-out" }}>
          {activeTask ? (
            <div className="w-[85vw] rotate-2 opacity-95 sm:w-72">
              <TaskCard
                task={activeTask}
                assignee={getUser(activeTask.assigneeId)}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default BoardView;
