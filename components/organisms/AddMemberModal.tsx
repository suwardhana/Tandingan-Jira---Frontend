import React, { useState } from "react";
import { User } from "../../types";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: Partial<User>) => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name,
      email,
      role,
      avatar: `https://i.pravatar.cc/150?u=${email}`,
    });
    onClose();
    setName("");
    setEmail("");
    setRole("");
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative flex w-full max-w-md animate-[fadeIn_0.2s_ease-out] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-surface">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-border">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Team Member</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 dark:border-dark-border dark:bg-dark-bg dark:text-white"
              placeholder="e.g. John Smith"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 dark:border-dark-border dark:bg-dark-bg dark:text-white"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 dark:border-dark-border dark:bg-dark-bg dark:text-white"
              placeholder="e.g. Frontend Developer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-jira-blue px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-jira-blue-hover"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
