import React from 'react';
import { User } from '../../types';
import Avatar from '../atoms/Avatar';

interface TeamViewProps {
    users: User[];
    onAddMemberClick: () => void;
}

const TeamView: React.FC<TeamViewProps> = ({ users, onAddMemberClick }) => {
  return (
    <div className="px-6 pb-6 h-full overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Team Members</h2>
        <button 
            onClick={onAddMemberClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar src={user.avatar} name={user.name} size="xl" className="border-4 border-gray-50 dark:border-dark-bg" />
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-4 border-white dark:border-dark-surface rounded-full"></div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">{user.role}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamView;
