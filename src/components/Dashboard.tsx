import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase, checkConnection } from '../lib/supabase';
import type { GroupWithDetails } from '../types/database';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import EditModal from './EditModal';
import Sidebar from './Sidebar/Sidebar';
import FileList from './FileList/FileList';

interface DashboardProps {
  onLogout: () => void;
}

interface DeleteModalState {
  isOpen: boolean;
  itemType: 'grupo' | 'subgrupo' | 'arquivo';
  itemName: string;
  itemId: string;
}

interface EditModalState {
  isOpen: boolean;
  itemType: 'grupo' | 'subgrupo' | 'arquivo';
  itemName: string;
  itemId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedSubgroup, setSelectedSubgroup] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLink, setNewFileLink] = useState('');
  const [addingSubgroupTo, setAddingSubgroupTo] = useState<string | null>(null);
  const [newSubgroupName, setNewSubgroupName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    itemType: 'grupo',
    itemName: '',
    itemId: ''
  });
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    itemType: 'grupo',
    itemName: '',
    itemId: ''
  });

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !userId) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{ name: newGroupName, user_id: userId }])
        .select();

      if (error) throw error;

      const newGroup = data[0];
      setGroups(prevGroups => [
        ...prevGroups,
        {
          ...newGroup,
          isExpanded: true,
          subgroups: []
        }
      ]);

      toast.success('Grupo criado com sucesso');
      setNewGroupName('');
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast.error('Erro ao criar grupo');
    }
  };

  const handleAddSubgroup = async (groupId: string) => {
    if (!newSubgroupName.trim() || !userId) return;

    try {
      const { data, error } = await supabase
        .from('subgroups')
        .insert([{
          name: newSubgroupName,
          group_id: groupId,
          user_id: userId
        }])
        .select();

      if (error) throw error;

      const newSubgroup = data[0];
      setGroups(prevGroups => 
        prevGroups.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              isExpanded: true,
              subgroups: [
                ...group.subgroups,
                {
                  ...newSubgroup,
                  isExpanded: true,
                  files: []
                }
              ]
            };
          }
          return group;
        })
      );

      setSelectedSubgroup(newSubgroup.id);
      toast.success('Subgrupo criado com sucesso');
      setNewSubgroupName('');
      setAddingSubgroupTo(null);
    } catch (error) {
      console.error('Erro ao criar subgrupo:', error);
      toast.error('Erro ao criar subgrupo');
    }
  };

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim() || !newFileLink.trim() || !selectedSubgroup || !userId) return;

    try {
      const { data, error } = await supabase
        .from('files')
        .insert([{
          name: newFileName,
          link: newFileLink,
          subgroup_id: selectedSubgroup,
          user_id: userId
        }])
        .select();

      if (error) throw error;

      const newFile = data[0];
      setGroups(prevGroups => 
        prevGroups.map(group => ({
          ...group,
          subgroups: group.subgroups.map(subgroup => {
            if (subgroup.id === selectedSubgroup) {
              return {
                ...subgroup,
                isExpanded: true,
                files: [...subgroup.files, newFile]
              };
            }
            return subgroup;
          })
        }))
      );

      toast.success('Arquivo adicionado com sucesso');
      setNewFileName('');
      setNewFileLink('');
    } catch (error) {
      console.error('Erro ao adicionar arquivo:', error);
      toast.error('Erro ao adicionar arquivo');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const { itemType, itemId } = deleteModal;
      let table = '';
      
      switch (itemType) {
        case 'grupo':
          table = 'groups';
          break;
        case 'subgrupo':
          table = 'subgroups';
          break;
        case 'arquivo':
          table = 'files';
          break;
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setGroups(prevGroups => {
        switch (itemType) {
          case 'grupo':
            return prevGroups.filter(group => group.id !== itemId);
          case 'subgrupo':
            if (selectedSubgroup === itemId) {
              setSelectedSubgroup(null);
            }
            return prevGroups.map(group => ({
              ...group,
              subgroups: group.subgroups.filter(subgroup => subgroup.id !== itemId)
            }));
          case 'arquivo':
            return prevGroups.map(group => ({
              ...group,
              subgroups: group.subgroups.map(subgroup => ({
                ...subgroup,
                files: subgroup.files.filter(file => file.id !== itemId)
              }))
            }));
          default:
            return prevGroups;
        }
      });

      toast.success(`${itemType} excluído com sucesso`);
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error(`Erro ao excluir ${deleteModal.itemType.toLowerCase()}`);
    }
  };

  const handleEdit = async (newName: string) => {
    try {
      const { itemType, itemId } = editModal;
      let table = '';
      
      switch (itemType) {
        case 'grupo':
          table = 'groups';
          break;
        case 'subgrupo':
          table = 'subgroups';
          break;
        case 'arquivo':
          table = 'files';
          break;
      }

      const { error } = await supabase
        .from(table)
        .update({ name: newName })
        .eq('id', itemId);

      if (error) throw error;

      setGroups(prevGroups => {
        switch (itemType) {
          case 'grupo':
            return prevGroups.map(group => 
              group.id === itemId ? { ...group, name: newName } : group
            );
          case 'subgrupo':
            return prevGroups.map(group => ({
              ...group,
              subgroups: group.subgroups.map(subgroup => 
                subgroup.id === itemId ? { ...subgroup, name: newName } : subgroup
              )
            }));
          case 'arquivo':
            return prevGroups.map(group => ({
              ...group,
              subgroups: group.subgroups.map(subgroup => ({
                ...subgroup,
                files: subgroup.files.map(file => 
                  file.id === itemId ? { ...file, name: newName } : file
                )
              }))
            }));
          default:
            return prevGroups;
        }
      });

      toast.success(`${itemType} atualizado com sucesso`);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast.error(`Erro ao atualizar ${editModal.itemType.toLowerCase()}`);
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência');
  };

  const toggleGroupExpansion = useCallback((groupId: string) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId 
          ? { ...group, isExpanded: !group.isExpanded }
          : group
      )
    );
  }, []);

  const handleSubgroupClick = useCallback((groupId: string, subgroupId: string) => {
    setSelectedSubgroup(prevSelected => 
      prevSelected === subgroupId ? null : subgroupId
    );
    
    setGroups(prevGroups => 
      prevGroups.map(group => ({
        ...group,
        isExpanded: group.id === groupId ? true : group.isExpanded,
        subgroups: group.subgroups.map(subgroup => ({
          ...subgroup,
          isExpanded: subgroup.id === subgroupId ? !subgroup.isExpanded : subgroup.isExpanded
        }))
      }))
    );
  }, []);

  const fetchGroups = useCallback(async () => {
    if (!isConnected || !userId) return;

    try {
      setIsLoading(true);
      const [groupsResponse, subgroupsResponse, filesResponse] = await Promise.all([
        supabase.from('groups').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('subgroups').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('files').select('*').eq('user_id', userId).order('created_at', { ascending: true })
      ]);

      if (groupsResponse.error) throw groupsResponse.error;
      if (subgroupsResponse.error) throw subgroupsResponse.error;
      if (filesResponse.error) throw filesResponse.error;

      const groupsWithDetails: GroupWithDetails[] = (groupsResponse.data || []).map(group => {
        const existingGroup = groups.find(g => g.id === group.id);
        
        return {
          ...group,
          isExpanded: existingGroup?.isExpanded ?? false,
          subgroups: (subgroupsResponse.data || [])
            .filter(subgroup => subgroup.group_id === group.id)
            .map(subgroup => {
              const existingSubgroup = existingGroup?.subgroups.find(s => s.id === subgroup.id);
              
              return {
                ...subgroup,
                isExpanded: existingSubgroup?.isExpanded ?? false,
                files: (filesResponse.data || []).filter(file => file.subgroup_id === subgroup.id)
              };
            })
        };
      });

      setGroups(groupsWithDetails);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      const errorMessage = handleSupabaseError(error);
      setError(errorMessage);
      const connected = await checkConnection();
      setIsConnected(connected);
      
      if (!connected) {
        toast.error('Conexão perdida com o servidor');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, userId, groups]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          onLogout();
          return;
        }

        const connected = await checkConnection();
        setIsConnected(connected);
        
        if (!connected) {
          setError('Erro de conexão com o banco de dados. Por favor, recarregue a página.');
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        } else {
          onLogout();
        }
      } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        setError('Erro ao inicializar a aplicação');
        onLogout();
      }
    };

    initializeApp();
  }, [onLogout]);

  useEffect(() => {
    if (userId && isConnected) {
      fetchGroups();
    }
  }, [userId, isConnected, fetchGroups]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDeleteConfirm}
        itemType={deleteModal.itemType}
        itemName={deleteModal.itemName}
      />

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ ...editModal, isOpen: false })}
        onConfirm={handleEdit}
        itemType={editModal.itemType}
        itemName={editModal.itemName}
      />

      <div className="flex h-screen overflow-hidden">
        <Sidebar
          groups={groups}
          newGroupName={newGroupName}
          addingSubgroupTo={addingSubgroupTo}
          newSubgroupName={newSubgroupName}
          isConnected={isConnected}
          error={error}
          onLogout={onLogout}
          onGroupNameChange={setNewGroupName}
          onAddGroup={handleAddGroup}
          onToggleGroupExpansion={toggleGroupExpansion}
          onEditGroup={(id, name) => setEditModal({
            isOpen: true,
            itemType: 'grupo',
            itemName: name,
            itemId: id
          })}
          onDeleteGroup={(id, name) => setDeleteModal({
            isOpen: true,
            itemType: 'grupo',
            itemName: name,
            itemId: id
          })}
          onAddSubgroup={handleAddSubgroup}
          onSubgroupNameChange={setNewSubgroupName}
          onCancelAddSubgroup={() => setAddingSubgroupTo(null)}
          onStartAddSubgroup={setAddingSubgroupTo}
          onSubgroupClick={handleSubgroupClick}
          onEditSubgroup={(id, name) => setEditModal({
            isOpen: true,
            itemType: 'subgrupo',
            itemName: name,
            itemId: id
          })}
          onDeleteSubgroup={(id, name) => setDeleteModal({
            isOpen: true,
            itemType: 'subgrupo',
            itemName: name,
            itemId: id
          })}
        />

        <FileList
          groups={groups}
          selectedSubgroup={selectedSubgroup}
          newFileName={newFileName}
          newFileLink={newFileLink}
          onFileNameChange={setNewFileName}
          onFileLinkChange={setNewFileLink}
          onAddFile={handleAddFile}
          onCopyLink={handleCopyLink}
          onEditFile={(id, name) => setEditModal({
            isOpen: true,
            itemType: 'arquivo',
            itemName: name,
            itemId: id
          })}
          onDeleteFile={(id, name) => setDeleteModal({
            isOpen: true,
            itemType: 'arquivo',
            itemName: name,
            itemId: id
          })}
        />
      </div>
    </div>
  );
};

export default Dashboard;