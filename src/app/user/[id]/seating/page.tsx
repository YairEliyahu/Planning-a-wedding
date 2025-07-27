'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

// Import Providers
import { QueryProvider } from './providers/QueryProvider';
import { SeatingProvider, useSeating } from './context';

// Import Components
import UnassignedGuestsList from './components/UnassignedGuestsList';
import SeatingMap from './components/SeatingMap';
import Statistics from './components/Statistics';
import EventSetupModal from './components/EventSetupModal';
import TableDetailModal from './components/TableDetailModal';
import AddTableModal from './components/AddTableModal';
import ClearConfirmModal from './components/ClearConfirmModal';

// Main component with context
function SeatingArrangementsContent() {
  const {
    // State
    tables,
    unassignedGuests,
    isLoading,
    confirmedGuestsCount,
    isAutoSaving,
    lastSaved,
    
    // Modal states
    showEventSetupModal,
    showTableDetailModal,
    showAddTableModal,
    showClearConfirmModal,
    
    // Actions
    setShowEventSetupModal,
    setShowTableDetailModal,
    setShowAddTableModal,
    setShowClearConfirmModal,
    setHasShownEventSetup,
    
    // Business logic
    getGuestStatusInfo,
    generateTableLayout,
    smartAutoAssignGuests,
  } = useSeating();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-[var(--font-heebo)]">טוען את רשימת האורחים...</p>
          <p className="mt-2 text-sm text-gray-500 font-[var(--font-heebo)]">מסנכרן עם מסד הנתונים</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 p-4">
        <div className="container mx-auto px-4 py-8">
          {/* Header with actions */}
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 font-[var(--font-heebo)]">
                  🎯 סידורי הושבה
                </h1>
                <p className="text-gray-600 mt-2 font-[var(--font-heebo)]">
                  ארגנו את האורחים שלכם בשולחנות בצורה אופטימלית
                </p>
                
                {/* Auto-save status indicator */}
                <div className="flex items-center gap-2 mt-2">
                  {isAutoSaving ? (
                    <div className="flex items-center gap-2 text-blue-600 text-sm font-[var(--font-heebo)]">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>שומר...</span>
                    </div>
                  ) : lastSaved ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-[var(--font-heebo)]">
                      <span>💾</span>
                      <span>נשמר אוטומטית {lastSaved.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-[var(--font-heebo)]">
                      <span>💾</span>
                      <span>שמירה אוטומטית פעילה</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowEventSetupModal(true)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-[var(--font-heebo)] text-sm"
                >
                  🎯 הגדרת אירוע
                </button>
                
                <button
                  onClick={() => setShowAddTableModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-[var(--font-heebo)] text-sm"
                >
                  🆕 הוסף שולחן
                </button>
                
                {tables.length > 0 && (
                    <button
                      onClick={smartAutoAssignGuests}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-[var(--font-heebo)] text-sm"
                      disabled={unassignedGuests.filter((g: any) => g.isConfirmed).length === 0}
                    >
                      🧠 הושבה חכמה
                  </button>
                )}
                
                <button
                  onClick={() => setShowClearConfirmModal(true)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-[var(--font-heebo)] text-sm"
                >
                  🗑️ נקה הכל
                    </button>
              </div>
            </div>
            
            {/* Quick Instructions */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-700 font-[var(--font-heebo)]">
                <span className="font-semibold text-blue-700">🎯 הוראות מהירות:</span>
                <br />
                • <strong>גרור</strong> אורחים מהרשימה לשולחנות 
                • <strong>לחץ</strong> על שולחן לפתיחת פרטים והוספת אורחים
                • <strong>רחף</strong> עם העכבר על אורח בשולחן ולחץ ❌ להסרה
                • <strong>גרור</strong> שולחנות למיקום חדש במפה
                • <strong>שמירה אוטומטית</strong> - כל שינוי נשמר אוטומטית תוך 2 שניות
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Unassigned Guests Panel */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <UnassignedGuestsList 
                guests={unassignedGuests}
                getGuestStatusInfo={getGuestStatusInfo}
              />
            </div>

            {/* Seating Chart */}
            <div className="lg:col-span-3 w-full order-1 lg:order-2">
              <SeatingMap />
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-6">
            <Statistics 
              tables={tables}
              unassignedGuests={unassignedGuests}
            />
          </div>
        </div>

        {/* Event Setup Modal */}
        <EventSetupModal
          isOpen={showEventSetupModal}
          onClose={() => {
            setShowEventSetupModal(false);
            setHasShownEventSetup(true);
          }}
          onSubmit={(eventData) => {
            generateTableLayout(eventData);
          }}
          confirmedGuestsCount={confirmedGuestsCount}
        />

        {/* Table Detail Modal */}
        <TableDetailModal
          isOpen={showTableDetailModal}
          onClose={() => setShowTableDetailModal(false)}
        />

        {/* Add Table Modal */}
        <AddTableModal
          isOpen={showAddTableModal}
          onClose={() => setShowAddTableModal(false)}
        />

        {/* Clear Confirm Modal */}
        <ClearConfirmModal
          isOpen={showClearConfirmModal}
          onClose={() => setShowClearConfirmModal(false)}
        />

      </div>
    </>
  );
}

// Main exported component with providers
export default function SeatingArrangements() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <QueryProvider>
      <SeatingProvider userId={userId}>
        <SeatingArrangementsContent />
      </SeatingProvider>
    </QueryProvider>
  );
} 