'use client';

import { ChecklistItem as ChecklistItemType } from '../types';
import { useChecklistContext } from '../context/ChecklistContext';
import { getPriorityClass, getPriorityLabel, validateNumericInput } from '../utils/checklistUtils';

interface ChecklistItemProps {
  item: ChecklistItemType;
}

export default function ChecklistItem({ item }: ChecklistItemProps) {
  const { 
    toggleItem, 
    updateBudget, 
    updateGuestCount, 
    updateAverageGift, 
    updateCostPerPerson 
  } = useChecklistContext();

  const isVenueItem = item.id === '1';

  return (
    <div 
      className={`flex items-center p-4 rounded-lg transition-colors duration-200 ${
        item.isCompleted ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={item.isCompleted}
          onChange={() => toggleItem(item.id)}
          className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 cursor-pointer"
        />
        {item.isCompleted && (
          <svg
            className="absolute w-4 h-4 text-green-500 transform translate-x-0.5 translate-y-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      
      <div className="mr-4 flex-1">
        <div className="flex items-center">
          <span className={`text-lg ${
            item.isCompleted 
              ? 'line-through text-gray-500' 
              : 'text-gray-700'
          }`}>
            {item.name}
          </span>
          {item.priority && (
            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPriorityClass(item.priority)}`}>
              {getPriorityLabel(item.priority)}
            </span>
          )}
        </div>
        {item.subCategory && (
          <span className="block text-sm text-gray-500">
            {item.subCategory}
          </span>
        )}
      </div>
      
      <div className="flex flex-col space-y-2">
        {isVenueItem ? (
          <>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="number"
                value={item.guestCount === 0 ? '' : item.guestCount}
                onChange={(e) => updateGuestCount(item.id, e.target.value)}
                placeholder="כמות אורחים"
                className="w-32 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <span className="text-sm text-gray-500">אורחים</span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={item.costPerPerson === 0 ? '' : item.costPerPerson}
                onChange={(e) => {
                  const value = validateNumericInput(e.target.value);
                  updateCostPerPerson(item.id, value);
                }}
                placeholder="מחיר למנה"
                className="w-32 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">₪ למנה</span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="number"
                value={item.averageGift === 0 ? '' : item.averageGift}
                onChange={(e) => updateAverageGift(item.id, e.target.value)}
                placeholder="ממוצע למעטפה"
                className="w-32 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="1"
              />
              <span className="text-sm text-gray-500">₪ למעטפה</span>
            </div>
          </>
        ) : (
          <div className="relative">
            <input
              type="number"
              value={item.budget}
              onChange={(e) => updateBudget(item.id, e.target.value)}
              placeholder="תקציב"
              className="w-32 p-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="100"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₪</span>
          </div>
        )}
      </div>
    </div>
  );
} 