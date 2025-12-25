import React, { useState, useRef, useEffect } from 'react';
import { Task, User, Priority, Status, IssueType } from '../../types';
import Avatar from '../atoms/Avatar';
import PriorityIcon from '../atoms/PriorityIcon';

interface IssueModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onAddComment: (taskId: string, text: string) => void;
}

const IssueModal: React.FC<IssueModalProps> = ({ task, isOpen, onClose, users, onUpdateTask, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [isLabelInputVisible, setIsLabelInputVisible] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const typePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLabelInputVisible && labelInputRef.current) {
        labelInputRef.current.focus();
    }
  }, [isLabelInputVisible]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (typePickerRef.current && !typePickerRef.current.contains(event.target as Node)) {
            setIsTypePickerOpen(false);
        }
    };
    if (isTypePickerOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTypePickerOpen]);

  if (!isOpen || !task) return null;

  const assignee = users.find(u => u.id === task.assigneeId);
  const currentUser = users[0];

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(task.id, newComment);
    setNewComment('');
  };

  const handleAddLabel = () => {
      if (newLabel.trim() && !task.labels.includes(newLabel.trim())) {
          onUpdateTask(task.id, { labels: [...task.labels, newLabel.trim()] });
      }
      setNewLabel('');
      setIsLabelInputVisible(false);
  };

  const handleRemoveLabel = (label: string) => {
      onUpdateTask(task.id, { labels: task.labels.filter(l => l !== label) });
  };

  const insertMarkdown = (syntax: string) => {
      const textarea = document.getElementById('description-editor') as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      
      const before = text.substring(0, start);
      const selection = text.substring(start, end);
      const after = text.substring(end);

      let newText = '';
      if (syntax === 'list') {
          newText = before + `\n- ${selection}` + after;
      } else {
          newText = before + `${syntax}${selection}${syntax}` + after;
      }

      onUpdateTask(task.id, { description: newText });
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
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
     const formatted = adjustedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
     onUpdateTask(task.id, { dueDate: formatted });
  };

  const dummyHistory = [
      { id: 'h1', action: 'changed status to In Progress', user: 'Jane Doe', time: '2 hours ago' },
      { id: 'h2', action: 'updated the description', user: 'Mike Chen', time: '5 hours ago' },
      { id: 'h3', action: 'created this issue', user: 'Jane Doe', time: 'Yesterday' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      <div className="relative bg-white dark:bg-dark-surface w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="relative" ref={typePickerRef}>
                    <button 
                        onClick={() => setIsTypePickerOpen(!isTypePickerOpen)}
                        className="flex items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Change issue type"
                    >
                        <span className={`material-symbols-outlined text-2xl ${task.type === IssueType.BUG ? 'text-red-500' : 'text-blue-500'}`}>
                            {task.type === IssueType.BUG ? 'bug_report' : 'check_box'}
                        </span>
                    </button>
                    
                    {isTypePickerOpen && (
                        <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-dark-surface rounded-lg shadow-xl border border-gray-200 dark:border-dark-border py-1 z-50 animate-[fadeIn_0.1s_ease-out]">
                            <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase border-b border-gray-100 dark:border-dark-border mb-1">
                                Change Type
                            </div>
                            {Object.values(IssueType).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        onUpdateTask(task.id, { type });
                                        setIsTypePickerOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${task.type === type ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${type === IssueType.BUG ? 'text-red-500' : 'text-blue-500'}`}>
                                        {type === IssueType.BUG ? 'bug_report' : 'check_box'}
                                    </span>
                                    <span>{type}</span>
                                    {task.type === type && <span className="material-symbols-outlined text-[16px] ml-auto">check</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <span className="font-medium hover:underline cursor-pointer text-base">{task.key}</span>
            </div>
            <div className="flex items-center gap-2">
                 <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50">
                    <span className="material-symbols-outlined">more_horiz</span>
                 </button>
                 <button 
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50"
                 >
                    <span className="material-symbols-outlined">close</span>
                 </button>
            </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full">
                {/* Main Content */}
                <div className="lg:col-span-8 p-6 space-y-8 border-r border-gray-200 dark:border-dark-border border-b lg:border-b-0">
                    <div>
                        <div className="group relative">
                            <input 
                                value={task.title}
                                onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
                                className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-6 bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-dark-bg border border-transparent hover:border-gray-200 dark:hover:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded p-2 -ml-2 w-full transition-all"
                            />
                            <span className="material-symbols-outlined absolute right-2 top-3 text-slate-400 opacity-0 group-hover:opacity-100 pointer-events-none">edit</span>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Description</h3>
                            <div className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
                                    <button onClick={() => insertMarkdown('**')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Bold">
                                        <span className="material-symbols-outlined text-[18px]">format_bold</span>
                                    </button>
                                    <button onClick={() => insertMarkdown('*')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Italic">
                                        <span className="material-symbols-outlined text-[18px]">format_italic</span>
                                    </button>
                                    <button onClick={() => insertMarkdown('list')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="List">
                                        <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                                    </button>
                                </div>
                                <textarea 
                                    id="description-editor"
                                    value={task.description}
                                    onChange={(e) => onUpdateTask(task.id, { description: e.target.value })}
                                    className="w-full bg-transparent border-none p-3 text-sm text-slate-600 dark:text-slate-300 focus:ring-0 resize-y min-h-[120px]"
                                    placeholder="Add a detailed description..."
                                />
                            </div>
                        </div>
                    </div>

                    {task.subtasks && task.subtasks.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Subtasks</h3>
                                <div className="h-1.5 w-24 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500" 
                                        style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {task.subtasks.map(sub => (
                                    <div key={sub.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 group cursor-pointer transition-colors">
                                        <input type="checkbox" checked={sub.completed} readOnly className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <span className={`text-sm ${sub.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {sub.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Attachments</h3>
                        <div className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">cloud_upload</span>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Drop files to attach, or <span className="text-blue-500 font-medium">browse</span></p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-dark-border">
                        <div className="flex gap-6 border-b border-gray-200 dark:border-dark-border">
                             <button 
                                onClick={() => setActiveTab('comments')}
                                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'comments' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                             >
                                Comments
                             </button>
                             <button 
                                onClick={() => setActiveTab('history')}
                                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'history' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                             >
                                History
                             </button>
                        </div>
                        
                        {activeTab === 'comments' ? (
                            <>
                                <div className="space-y-4 mb-6">
                                    {task.comments?.map(comment => {
                                        const commentUser = users.find(u => u.id === comment.userId);
                                        return (
                                            <div key={comment.id} className="flex gap-3">
                                                <Avatar src={commentUser?.avatar} name={commentUser?.name} size="lg" />
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{commentUser?.name}</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{comment.createdAt}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">{comment.text}</p>
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
                                            className="w-full rounded-lg border-gray-300 dark:border-dark-border dark:bg-dark-bg text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                                            rows={2}
                                            placeholder="Add a comment..."
                                        ></textarea>
                                        <div className="mt-2 flex justify-end gap-2">
                                            <button 
                                                onClick={handleCommentSubmit}
                                                disabled={!newComment.trim()}
                                                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                {dummyHistory.map(item => (
                                    <div key={item.id} className="flex gap-3 items-start">
                                        <div className="mt-1 size-2 rounded-full bg-gray-300 dark:bg-slate-600"></div>
                                        <div className="text-sm">
                                            <span className="font-bold text-slate-900 dark:text-white">{item.user}</span> <span className="text-slate-600 dark:text-slate-300">{item.action}</span>
                                            <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 p-6 space-y-6 bg-gray-50/50 dark:bg-dark-bg/20">
                     <div className="space-y-1">
                         <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Status</label>
                         <select 
                            value={task.status}
                            onChange={(e) => onUpdateTask(task.id, { status: e.target.value as Status })}
                            className="w-full bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                     </div>

                     <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-gray-200 dark:border-dark-border">Details</h3>
                        
                        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Assignee</span>
                            <div className="relative">
                                <select 
                                    value={task.assigneeId || ''}
                                    onChange={(e) => onUpdateTask(task.id, { assigneeId: e.target.value || undefined })}
                                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md border border-gray-200 dark:border-dark-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-700 dark:text-slate-200 font-medium cursor-pointer appearance-none shadow-sm transition-colors"
                                >
                                    <option value="">Unassigned</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                                {assignee ? (
                                    <Avatar src={assignee.avatar} name={assignee.name} size="sm" className="absolute left-2.5 top-2 pointer-events-none" />
                                ) : (
                                    <span className="material-symbols-outlined absolute left-2 top-2 text-slate-400 text-lg pointer-events-none">person</span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Priority</span>
                            <div className="relative">
                                <select 
                                    value={task.priority}
                                    onChange={(e) => onUpdateTask(task.id, { priority: e.target.value as Priority })}
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md border border-gray-200 dark:border-dark-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-700 dark:text-slate-200 font-medium cursor-pointer appearance-none shadow-sm transition-colors"
                                >
                                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <div className="absolute left-2 top-2 pointer-events-none">
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
                                className="w-full py-1 bg-transparent hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-md border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-700 dark:text-slate-300"
                            />
                        </div>

                         <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                             <span className="text-sm text-slate-500 dark:text-slate-400">Created</span>
                             <span className="text-sm text-slate-700 dark:text-slate-300">{task.createdAt}</span>
                         </div>
                         <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                             <span className="text-sm text-slate-500 dark:text-slate-400">Updated</span>
                             <span className="text-sm text-slate-700 dark:text-slate-300">{task.updatedAt}</span>
                         </div>
                     </div>

                     <div className="space-y-2">
                         <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Labels</label>
                            {!isLabelInputVisible && (
                                <button 
                                    onClick={() => setIsLabelInputVisible(true)}
                                    className="text-blue-500 hover:underline text-xs"
                                >
                                    Add
                                </button>
                            )}
                         </div>
                         <div className="flex flex-wrap gap-2">
                             {task.labels.map(l => (
                                 <span key={l} className="group relative px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-gray-200 dark:border-gray-700 flex items-center gap-1">
                                     {l}
                                     <button onClick={() => handleRemoveLabel(l)} className="hidden group-hover:block hover:text-red-500">
                                         <span className="material-symbols-outlined text-[10px] font-bold">close</span>
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
                                        if (e.key === 'Enter') handleAddLabel();
                                        if (e.key === 'Escape') setIsLabelInputVisible(false);
                                    }}
                                    onBlur={() => {
                                        if (!newLabel) setIsLabelInputVisible(false);
                                    }}
                                    className="w-24 px-2 py-1 text-xs rounded border border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-dark-bg text-slate-900 dark:text-white"
                                    placeholder="Type & Enter"
                                />
                             ) : (
                                <button 
                                    onClick={() => setIsLabelInputVisible(true)}
                                    className="px-2 py-1 rounded border border-dashed border-gray-300 dark:border-gray-600 text-slate-400 text-xs hover:text-blue-500 hover:border-blue-500 flex items-center"
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
};

export default IssueModal;
