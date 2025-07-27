'use client';

import { Category } from '../types';
import { useChecklistContext } from '../context/ChecklistContext';
import { filterAndSortItems } from '../utils/checklistUtils';
import ChecklistItem from './ChecklistItem';
import AddItemForm from './AddItemForm';

interface ChecklistCategoryProps {
  category: Category;
}

export default function ChecklistCategory({ category }: ChecklistCategoryProps) {
  const { 
    filters, 
    toggleCategory, 
    setSelectedCategory, 
    setIsAddingItem, 
    isAddingItem, 
    selectedCategory 
  } = useChecklistContext();

  const filteredItems = filterAndSortItems(category.items, filters.filter, filters.sortBy);

  const handleAddClick = () => {
    setSelectedCategory(category.name);
    setIsAddingItem(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="text-2xl">{category.icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
              {category.description && (
                <p className="text-sm text-gray-500">{category.description}</p>
              )}
            </div>
            <button
              onClick={handleAddClick}
              className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
              title="הוסף פריט חדש"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => toggleCategory(category.name)}
            className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            title={category.isExpanded ? 'כווץ קטגוריה' : 'הרחב קטגוריה'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transform transition-transform duration-200 ${category.isExpanded ? 'rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {category.isExpanded && (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <ChecklistItem key={item.id} item={item} />
            ))}

            {isAddingItem && selectedCategory === category.name && (
              <AddItemForm categoryName={category.name} />
            )}
          </div>
        )}
      </div>
    </div>
  );
} 