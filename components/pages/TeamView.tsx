import React from "react";
import { User } from "../../types";
import Avatar from "../atoms/Avatar";

interface TeamViewProps {
  users: User[];
  onAddMemberClick: () => void;
}

const TeamView: React.FC<TeamViewProps> = ({ users, onAddMemberClick }) => {
  return (
    <div className="custom-scrollbar h-full overflow-y-auto px-6 pb-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Team Members</h2>
        <button
          onClick={onAddMemberClick}
          className="flex items-center gap-2 rounded-lg bg-jira-blue px-4 py-2 text-sm font-medium text-white hover:bg-jira-blue-hover"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar
                  src={user.avatar}
                  name={user.name}
                  size="xl"
                  className="border-4 border-gray-50 dark:border-dark-bg"
                />
                <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-4 border-white bg-green-500 dark:border-dark-surface"></div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h3>
              <p className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                {user.role}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamView;
