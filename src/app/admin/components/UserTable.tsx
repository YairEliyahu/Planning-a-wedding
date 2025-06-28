'use client';

import { useState, useMemo } from 'react';
import { useUsers, useUserSearch, useUserActions } from '../hooks/useUsers';
import { UserFilters } from '../db/interfaces/IUserRepository';

export default function UserTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // משתמש ב-hooks החדשים
  const { data: allUsers = [], isLoading: usersLoading, error: usersError } = useUsers(Object.keys(filters).length > 0 ? filters : undefined);
  const { data: searchResults = [], isLoading: searchLoading } = useUserSearch(searchQuery, searchQuery.trim().length >= 3);
  const { updateStatus, delete: deleteUser, bulkDelete } = useUserActions();

  // קביעת המשתמשים המוצגים
  const displayedUsers = useMemo(() => {
    if (searchQuery.trim().length >= 3) {
      return searchResults;
    }
    return allUsers;
  }, [searchQuery, searchResults, allUsers]);

  const isLoading = usersLoading || searchLoading;
  const error = usersError;

  // טיפול בבחירת משתמשים
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === displayedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(displayedUsers.map(user => user._id));
    }
  };

  // פעולות על משתמשים
  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    updateStatus.mutate({ userId, isActive: !currentStatus });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את המשתמש?')) {
      deleteUser.mutate(userId);
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return;
    if (confirm(`האם אתה בטוח שברצונך למחוק ${selectedUsers.length} משתמשים?`)) {
      bulkDelete.mutate(selectedUsers);
      setSelectedUsers([]);
    }
  };

  // עדכון פילטרים
  const updateFilter = (key: keyof UserFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">שגיאה בטעינת נתוני המשתמשים</p>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header עם חיפוש ופעולות */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">ניהול משתמשים</h2>
            <p className="text-gray-600 mt-1">
              מציג: {displayedUsers.length} מתוך {allUsers.length} משתמשים
            </p>
          </div>
          
          <div className="flex gap-2">
            {selectedUsers.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={bulkDelete.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                מחק נבחרים ({selectedUsers.length})
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              סינון
            </button>
          </div>
        </div>

        {/* שורת חיפוש */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="חיפוש משתמשים (שם, אימייל, טלפון)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* פילטרים */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <select
              value={filters.role || ''}
              onChange={(e) => updateFilter('role', e.target.value || undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">כל התפקידים</option>
              <option value="user">משתמש</option>
              <option value="admin">אדמין</option>
            </select>

            <select
              value={filters.isActive?.toString() || ''}
              onChange={(e) => updateFilter('isActive', e.target.value ? e.target.value === 'true' : undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">כל הסטטוסים</option>
              <option value="true">פעיל</option>
              <option value="false">לא פעיל</option>
            </select>

            <select
              value={filters.authProvider || ''}
              onChange={(e) => updateFilter('authProvider', e.target.value || undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">כל הספקים</option>
              <option value="email">אימייל</option>
              <option value="google">Google</option>
              <option value="hybrid">משולב</option>
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              נקה פילטרים
            </button>
          </div>
        )}
      </div>

      {/* טבלה */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === displayedUsers.length && displayedUsers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                שם מלא
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                אימייל
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                תפקיד
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                סטטוס
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                תאריך הצטרפות
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                פעולות
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleSelectUser(user._id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                  {user.partnerName && (
                    <div className="text-sm text-gray-500">זוג: {user.partnerName}</div>
                  )}
                  {user.phone && (
                    <div className="text-sm text-gray-500">טלפון: {user.phone}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.authProvider}</div>
                  {user.emailVerified && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      מאומת
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'admin' ? 'אדמין' : 'משתמש'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleStatus(user._id, user.isActive)}
                    disabled={updateStatus.isPending}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {user.isActive ? 'פעיל' : 'לא פעיל'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('he-IL')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    disabled={deleteUser.isPending}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    מחק
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {displayedUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery ? 'לא נמצאו משתמשים התואמים לחיפוש' : 'לא נמצאו משתמשים'}
          </p>
        </div>
      )}
    </div>
  );
} 