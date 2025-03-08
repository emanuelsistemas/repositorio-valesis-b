import React from 'react';
import { ChevronDown, ChevronRight, Folder, Pencil, Trash2, Plus, X } from 'lucide-react';
import type { GroupWithDetails } from '../../types/database';

interface GroupItemProps {
  group: GroupWithDetails;
  addingSubgroupTo: string | null;
  newSubgroupName: string;
  onToggleExpansion: (groupId: string) => void;
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

const GroupItem: React.FC<GroupItemProps> = ({
  group,
  addingSubgroupTo,
  newSubgroupName,
  onToggleExpansion,
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
    <div className="bg-gray-700 rounded-lg overflow-hidden">
      <div className="p-3 flex items-center justify-between">
        <button
          onClick={() => onToggleExpansion(group.id)}
          className="flex items-center gap-2 text-left flex-1"
        >
          {group.isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <Folder className="w-4 h-4 text-blue-400" />
          <span className="font-medium">{group.name}</span>
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => onEditGroup(group.id, group.name)}
            className="p-1 hover:text-blue-400 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteGroup(group.id, group.name)}
            className="p-1 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {group.isExpanded && (
        <div className="bg-gray-750 p-3 border-t border-gray-600">
          <div className="space-y-2">
            {group.subgroups.map(subgroup => (
              <div key={subgroup.id} className="bg-gray-650 rounded-md">
                <div className="p-2 flex items-center justify-between">
                  <button
                    onClick={() => onSubgroupClick(group.id, subgroup.id)}
                    className="flex items-center gap-2 text-left flex-1"
                  >
                    {subgroup.isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="text-sm">{subgroup.name}</span>
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditSubgroup(subgroup.id, subgroup.name)}
                      className="p-1 hover:text-blue-400 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSubgroup(subgroup.id, subgroup.name)}
                      className="p-1 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {addingSubgroupTo === group.id ? (
              <div className="mt-2 p-2 bg-gray-650 rounded-md">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubgroupName}
                    onChange={(e) => onSubgroupNameChange(e.target.value)}
                    placeholder="Nome do subgrupo"
                    className="flex-1 px-2 py-1.5 bg-gray-700 rounded-md text-sm text-gray-100 placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => onAddSubgroup(group.id)}
                    disabled={!newSubgroupName.trim()}
                    className="p-1.5 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onCancelAddSubgroup}
                    className="p-1.5 bg-gray-600 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onStartAddSubgroup(group.id)}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300 mt-2 p-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Subgrupo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupItem;