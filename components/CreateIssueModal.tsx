import React, { useState } from 'react';
import { Priority, Status, IssueType, User, Sprint, Task } from '../types';
import { SPRINTS } from '../constants';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Partial<Task>) => void;
  users: User[];
  currentSprintId: string;
}

const CreateIssueModal: React.FC<CreateIssueModalProps> = ({ isOpen, onClose, onCreate, users, currentSprintId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IssueType>(IssueType.TASK);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [sprintId, setSprintId] = useState<string>(currentSprintId);

  if (!isOpen) return null;

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
      reporterId: users[0].id, // Mock current user
      labels: [],
    });
    onClose();
    // Reset form
    setTitle('');
    setDescription('');
    setPriority(Priority.MEDIUM);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      <div className="relative bg-white dark:bg-dark-surface w-full max-w-lg rounded-xl shadow-2xl flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out] border border-gray-200 dark:border-dark-border">
        
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Issue</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Issue Type</label>
                <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as IssueType)}
                    className="w-full rounded-lg bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-slate-900 dark:text-white text-sm"
                >
                    {Object.values(IssueType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Summary <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full rounded-lg bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-slate-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Description</label>
                <textarea 
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a detailed description..."
                    className="w-full rounded-lg bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-slate-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Priority</label>
                    <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                        className="w-full rounded-lg bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-slate-900 dark:text-white text-sm"
                    >
                        {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Assignee</label>
                    <select 
                        value={assigneeId}
                        onChange={(e) => setAssigneeId(e.target.value)}
                        className="w-full rounded-lg bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-slate-900 dark:text-white text-sm"
                    >
                        <option value="">Unassigned</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Sprint</label>
                <select 
                    value={sprintId}
                    onChange={(e) => setSprintId(e.target.value)}
                    className="w-full rounded-lg bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-slate-900 dark:text-white text-sm"
                >
                    {SPRINTS.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
                </select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/20 transition-colors"
                >
                    Create Issue
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssueModal;
