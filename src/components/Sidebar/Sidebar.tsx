import React from 'react';
import { FolderPlus, LogOut, AlertCircle, User } from 'lucide-react';
import type { GroupWithDetails, Profile } from '../../types/database';
import GroupItem from './GroupItem';

interface SidebarProps {
  groups: GroupWithDetails[];
  newGroupName: string;
  addingSubgroupTo: string | null;
  newSubgroupName: string;
  isConnected: boolean;
  error: string | null;
  userProfile: Profile | null;
  onLogout: () => void;
  onGroupNameChange: (name: string) => void;
  onAddGroup: (e: React.FormEvent) => void;
  onToggleGroupExpansion: (groupId: string) => void;
  onEditGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string, name: string) => void;
  onAddSubgroup: (groupId: string) => void;
  onSubgroupNameChange: (name: string) => void;
  onCancelAddSubgroup: () => void;
  onStartAddSubgroup: (groupId: string) => void;
  onSubgroupClick: (groupId: string, subgroupId: string) => void;
  onEditSubgroup: (id: string, name: string) => void;
  onDeleteSubgroup: (id: string, name: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  groups,
  newGroupName,
  addingSubgroupTo,
  newSubgroupName,
  isConnected,
  error,
  userProfile,
  onLogout,
  onGroupNameChange,
  onAddGroup,
  onToggleGroupExpansion,
  onEditGroup,
  onDeleteGroup,
  onAddSubgroup,
  onSubgroupNameChange,
  onCancelAddSubgroup,
  onStartAddSubgroup,
  onSubgroupClick,
  onEditSubgroup,
  onDeleteSubgroup
}) => {
  return (
    <div className="w-96 bg-gray-800 p-6 overflow-y-auto border-r border-gray-700">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-md">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">{userProfile?.email}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center px-3 py-1.5 bg-red-600 rounded-md hover:bg-red-700 text-sm"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Sair
          </button>
        </div>

        {!isConnected && (
          <div className="p-3 bg-yellow-600 text-white rounded-md flex items-center text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Conexão perdida com o servidor...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500 text-white rounded-md flex items-center text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-3">Grupos</h2>
          <form onSubmit={onAddGroup} className="flex gap-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => onGroupNameChange(e.target.value)}
              placeholder="Nome do grupo"
              className="flex-1 px-3 py-2 bg-gray-700 rounded-md text-gray-100 placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newGroupName.trim()}
              className="p-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <FolderPlus className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div className="space-y-3">
          {groups.map(group => (
            <GroupItem
              key={group.id}
              group={group}
              addingSubgroupTo={addingSubgroupTo}
              newSubgroupName={newSubgroupName}
              onToggleExpansion={onToggleGroupExpansion}
              onEditGroup={onEditGroup}
              onDeleteGroup={onDeleteGroup}
              onAddSubgroup={onAddSubgroup}
              onSubgroupNameChange={onSubgroupNameChange}
              onCancelAddSubgroup={onCancelAddSubgroup}
              onStartAddSubgroup={onStartAddSubgroup}
              onSubgroupClick={onSubgroupClick}
              onEditSubgroup={onEditSubgroup}
              onDeleteSubgroup={onDeleteSubgroup}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;