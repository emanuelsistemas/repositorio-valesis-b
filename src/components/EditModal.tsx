import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  itemType: string;
  itemName: string;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemType,
  itemName,
}) => {
  const [newName, setNewName] = useState(itemName);

  useEffect(() => {
    setNewName(itemName);
  }, [itemName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-100">Editar {itemType}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-6">
          <label htmlFor="newName" className="block text-sm font-medium text-gray-300 mb-2">
            Nome
          </label>
          <input
            type="text"
            id="newName"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm(newName);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={!newName.trim()}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;