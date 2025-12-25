import React, { useState } from 'react';
import { User } from '../../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: Partial<User>) => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

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
    setName('');
    setEmail('');
    setRole('');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      <div className="relative bg-white dark:bg-dark-surface w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out] border border-gray-200 dark:border-dark-border">
        
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Team Member</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Name <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-slate-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. John Smith"
                />
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Email <span className="text-red-500">*</span></label>
                <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-slate-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@example.com"
                />
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Role <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border text-slate-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Frontend Developer"
                />
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
                    Add Member
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
