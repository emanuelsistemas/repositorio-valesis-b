import React from 'react';
import { Copy, Link2, Pencil, Trash2 } from 'lucide-react';
import type { File } from '../../types/database';

interface FileItemProps {
  file: File;
  onCopyLink: (link: string) => void;
  onEditFile: (id: string, name: string) => void;
  onDeleteFile: (id: string, name: string) => void;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  onCopyLink,
  onEditFile,
  onDeleteFile
}) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between border border-gray-700 hover:border-gray-600 transition-colors">
      <span className="truncate flex-1 font-medium">{file.name}</span>
      <div className="flex gap-2">
        <button
          onClick={() => onCopyLink(file.link)}
          className="p-2 hover:text-blue-400 transition-colors"
          title="Copiar link"
        >
          <Copy className="w-5 h-5" />
        </button>
        <a
          href={file.link}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:text-blue-400 transition-colors"
          title="Abrir link"
        >
          <Link2 className="w-5 h-5" />
        </a>
        <button
          onClick={() => onEditFile(file.id, file.name)}
          className="p-2 hover:text-blue-400 transition-colors"
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDeleteFile(file.id, file.name)}
          className="p-2 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FileItem;