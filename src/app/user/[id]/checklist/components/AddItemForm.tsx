'use client';

import { useChecklistContext } from '../context/ChecklistContext';

interface AddItemFormProps {
  categoryName: string;
}

export default function AddItemForm({ categoryName }: AddItemFormProps) {
  const { 
    newItemName, 
    setNewItemName, 
    addItem, 
    setIsAddingItem, 
    setSelectedCategory 
  } = useChecklistContext();

  const handleSubmit = () => {
    addItem(categoryName);
  };

  const handleCancel = () => {
    setIsAddingItem(false);
    setNewItemName('');
    setSelectedCategory('');
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <input
        type="text"
        value={newItemName}
        onChange={(e) => setNewItemName(e.target.value)}
        placeholder="הוסף פריט חדש"
        className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
      />
      <div className="flex justify-end mt-3 space-x-2 rtl:space-x-reverse">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          הוסף
        </button>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
        >
          ביטול
        </button>
      </div>
    </div>
  );
} 