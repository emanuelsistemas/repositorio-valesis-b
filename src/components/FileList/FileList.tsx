import React from 'react';
import { FileUp, Folder } from 'lucide-react';
import type { GroupWithDetails } from '../../types/database';
import FileItem from './FileItem';

interface FileListProps {
  groups: GroupWithDetails[];
  selectedSubgroup: string | null;
  newFileName: string;
  newFileLink: string;
  onFileNameChange: (name: string) => void;
  onFileLinkChange: (link: string) => void;
  onAddFile: (e: React.FormEvent) => void;
  onCopyLink: (link: string) => void;
  onEditFile: (id: string, name: string) => void;
  onDeleteFile: (id: string, name: string) => void;
}

const FileList: React.FC<FileListProps> = ({
  groups,
  selectedSubgroup,
  newFileName,
  newFileLink,
  onFileNameChange,
  onFileLinkChange,
  onAddFile,
  onCopyLink,
  onEditFile,
  onDeleteFile
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Arquivos</h2>
        <form onSubmit={onAddFile} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => onFileNameChange(e.target.value)}
            placeholder="Nome do arquivo"
            className="px-4 py-2.5 bg-gray-700 rounded-lg text-gray-100 placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newFileLink}
            onChange={(e) => onFileLinkChange(e.target.value)}
            placeholder="Link do arquivo"
            className="px-4 py-2.5 bg-gray-700 rounded-lg text-gray-100 placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newFileName.trim() || !newFileLink.trim() || !selectedSubgroup}
            className="md:col-span-2 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <FileUp className="w-5 h-5" />
            Adicionar Arquivo
          </button>
        </form>

        {selectedSubgroup ? (
          <div className="space-y-6">
            {groups.map(group =>
              group.subgroups
                .filter(subgroup => subgroup.id === selectedSubgroup)
                .map(subgroup => (
                  <div key={subgroup.id}>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Folder className="w-5 h-5 text-blue-400 mr-2" />
                      {group.name} / {subgroup.name}
                    </h3>
                    <div className="space-y-3">
                      {subgroup.files.map(file => (
                        <FileItem
                          key={file.id}
                          file={file}
                          onCopyLink={onCopyLink}
                          onEditFile={onEditFile}
                          onDeleteFile={onDeleteFile}
                        />
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12 bg-gray-800 rounded-lg border border-gray-700">
            <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Selecione um subgrupo para visualizar ou adicionar arquivos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileList;