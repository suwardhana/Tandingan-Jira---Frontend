import React, { useState } from "react";
import { Sprint } from "../../types";

interface NewSprintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (sprint: Partial<Sprint>) => void;
  anchorRect?: DOMRect;
}

const NewSprintDialog: React.FC<NewSprintDialogProps> = React.memo(
  ({ isOpen, onClose, onCreate, anchorRect }) => {
    const [sprintName, setSprintName] = useState("");
    const [sprintGoal, setSprintGoal] = useState("");
    const [sprintStart, setSprintStart] = useState("");
    const [sprintEnd, setSprintEnd] = useState("");

    if (!isOpen || !anchorRect) return null;

    const handleCreate = () => {
      if (!sprintName.trim()) return;
      onCreate({
        name: sprintName.trim(),
        goal: sprintGoal.trim(),
        startDate: sprintStart,
        endDate: sprintEnd,
      });
      setSprintName("");
      setSprintGoal("");
      setSprintStart("");
      setSprintEnd("");
      onClose();
    };

    const handleClose = () => {
      setSprintName("");
      setSprintGoal("");
      setSprintStart("");
      setSprintEnd("");
      onClose();
    };

    return (
      <>
        <div className="fixed inset-0 z-40" onClick={handleClose} />
        <div
          className="fixed z-50 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-dark-border dark:bg-dark-surface"
          style={{
            left: anchorRect.left,
            top: anchorRect.bottom + 8,
          }}
        >
          <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">New Sprint</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Sprint name"
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-slate-900 dark:border-dark-border dark:bg-dark-bg dark:text-white"
              autoFocus
            />
            <input
              type="text"
              placeholder="Sprint goal (optional)"
              value={sprintGoal}
              onChange={(e) => setSprintGoal(e.target.value)}
              className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-slate-900 dark:border-dark-border dark:bg-dark-bg dark:text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={sprintStart}
                onChange={(e) => setSprintStart(e.target.value)}
                className="w-full rounded-lg border-gray-200 bg-gray-50 text-xs text-slate-900 dark:border-dark-border dark:bg-dark-bg dark:text-white"
              />
              <input
                type="date"
                value={sprintEnd}
                onChange={(e) => setSprintEnd(e.target.value)}
                className="w-full rounded-lg border-gray-200 bg-gray-50 text-xs text-slate-900 dark:border-dark-border dark:bg-dark-bg dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={handleClose}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!sprintName.trim()}
                className="rounded-lg bg-jira-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-jira-blue-hover disabled:opacity-50"
              >
                Create Sprint
              </button>
            </div>
          </div>
        </div>
      </>
    );
  },
);

export default NewSprintDialog;
