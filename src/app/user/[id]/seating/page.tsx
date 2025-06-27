'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

// Import Providers
import { QueryProvider } from './providers/QueryProvider';
import { SeatingProvider } from './context/SeatingContext';

// Import Components
import UnassignedGuestsList from './components/UnassignedGuestsList';
import SeatingMap from './components/SeatingMap';
import Statistics from './components/Statistics';
import EventSetupModal from './components/EventSetupModal';
import { useSeating } from './context/SeatingContext';

// Main component with context
function SeatingArrangementsContent() {
  const {
    // State
    tables,
    unassignedGuests,
    isLoading,
    confirmedGuestsCount,
    
    // Modal states
    showEventSetupModal,
    
    // Actions
    setShowEventSetupModal,
    setHasShownEventSetup,
    
    // Business logic
    getGuestStatusInfo,
    generateTableLayout,
    smartAutoAssignGuests,
    saveSeatingArrangement,
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 font-[var(--font-heebo)]">
                  🪑 סידורי הושבה
                </h1>
                <p className="text-gray-600 mt-1 font-[var(--font-heebo)]">
                  סדרו את האורחים סביב השולחנות • גררו שולחנות להזזתם
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEventSetupModal(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-[var(--font-heebo)]"
                >
                  🎯 הגדרת אירוע חכמה
                </button>
                
                {tables.length > 0 && (
                  <>
                    <button
                      onClick={smartAutoAssignGuests}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-[var(--font-heebo)]"
                      disabled={unassignedGuests.filter(g => g.isConfirmed).length === 0}
                    >
                      🧠 הושבה חכמה
                    </button>
                    
                    <button
                      onClick={saveSeatingArrangement}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-[var(--font-heebo)]"
                    >
                      💾 שמור סידור הושבה
                    </button>
                  </>
                )}
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