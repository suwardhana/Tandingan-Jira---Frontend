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
  onCreateClick: () => void;
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
  onCreateClick: () => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  status,
  children,
  taskCount,
  isEmpty,
  onCreateClick,
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
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-lg bg-inherit px-3 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-primary dark:text-slate-200">
            {status}
          </h3>
          <span className="min-w-[20px] rounded-full bg-gray-200 px-1.5 py-0.5 text-center text-xs font-bold text-text-secondary dark:bg-slate-700 dark:text-slate-400">
            {taskCount}
          </span>
        </div>
        <button
          onClick={onCreateClick}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-gray-200 hover:text-text-primary dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <span className="material-symbols-outlined text-lg">add</span>
        </button>
      </div>

      <div className="custom-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {children}
        {/* Empty column drop target */}
        {isEmpty && (
          <div className="mx-1 mb-1 flex min-h-[80px] flex-1 items-center justify-center rounded-md border-2 border-dashed border-gray-300 transition-colors dark:border-slate-600">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              Drop issues here
            </span>
          </div>
        )}
        <button
          onClick={onCreateClick}
          className="flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium text-slate-400 transition-colors hover:bg-gray-200 dark:text-slate-500 dark:hover:bg-slate-700"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>Create issue</span>
        </button>
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
  onCreateClick,
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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Sprint Header */}
      <div className="flex shrink-0 flex-col justify-between gap-3 px-3 pb-3 sm:px-6 sm:pb-4 md:flex-row md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="text-lg font-bold text-text-primary dark:text-white sm:text-xl">
              {sprint.name}
            </h2>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                sprint.status === "active"
                  ? "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  : "border-slate-200 bg-slate-100 text-slate-600"
              }`}
            >
              {sprint.status}
            </span>
            <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:inline">
              {sprint.startDate} - {sprint.endDate}
            </span>
          </div>
          <p className="mt-1 max-w-2xl truncate text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            {sprint.goal}
          </p>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <div className="mr-2 flex -space-x-2">
            {users.slice(0, 3).map((u) => (
              <img
                key={u.id}
                src={u.avatar}
                className="size-8 rounded-full border-2 border-white dark:border-dark-bg"
                title={u.name}
                alt={u.name}
              />
            ))}
            {users.length > 3 && (
              <div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-bold text-slate-500 dark:border-dark-bg dark:bg-slate-700 dark:text-slate-300">
                +{users.length - 3}
              </div>
            )}
          </div>
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
                  onCreateClick={onCreateClick}
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
