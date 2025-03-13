'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Head from 'next/head';

interface Guest {
  id: string;
  name: string;
  phoneNumber: string;
  numberOfGuests: number;
  side: 'חתן' | 'כלה' | 'משותף';
  isConfirmed: boolean | null;
  notes: string;
}

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  weddingDate: string;
  partnerName: string;
  partnerPhone: string;
  expectedGuests: string;
  weddingLocation: string;
  budget: string;
  preferences: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
  isProfileComplete: boolean;
  authProvider: string;
  gender: 'male' | 'female';
  partnerGender: 'male' | 'female';
}

export default function GuestlistPage({ params }: { params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newGuest, setNewGuest] = useState<Guest>({
    id: '',
    name: '',
    phoneNumber: '',
    numberOfGuests: 1,
    side: 'משותף',
    isConfirmed: null,
    notes: ''
  });
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all');
  const [sideFilter, setSideFilter] = useState<'all' | 'חתן' | 'כלה' | 'משותף'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthReady) {
        console.log('Auth not ready yet');
        return;
      }

      console.log('Auth state:', { isAuthReady, user: user?._id });

      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/login');
        return;
      }

      if (user._id !== params.id) {
        console.log('User ID mismatch:', { userId: user._id, paramsId: params.id });
        router.push(`/user/${user._id}/guestlist`);
        return;
      }

      await Promise.all([
        fetchGuestlist(),
        fetchUserProfile()
      ]);
      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/user/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      if (!data.user.isProfileComplete) {
        router.push('/complete-profile');
        return;
      }

      setProfile(data.user);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const fetchGuestlist = async () => {
    try {
      // בפיתוח אמיתי - יש לשלוף נתונים מה-API
      // בינתיים נשתמש בנתונים לדוגמה
      const sampleGuests: Guest[] = [
        { id: '1', name: 'משה כהן', phoneNumber: '050-1234567', numberOfGuests: 2, side: 'חתן', isConfirmed: true, notes: 'חבר קרוב' },
        { id: '2', name: 'רחל לוי', phoneNumber: '052-7654321', numberOfGuests: 3, side: 'כלה', isConfirmed: false, notes: 'מגיעה מרחוק' },
        { id: '3', name: 'דוד ישראלי', phoneNumber: '054-1112222', numberOfGuests: 1, side: 'משותף', isConfirmed: null, notes: '' },
        { id: '4', name: 'יעל אברהם', phoneNumber: '058-3334444', numberOfGuests: 4, side: 'חתן', isConfirmed: true, notes: 'אלרגיה לאגוזים' },
        { id: '5', name: 'יוסף חיים', phoneNumber: '053-5556666', numberOfGuests: 2, side: 'כלה', isConfirmed: null, notes: '' }
      ];
      setGuests(sampleGuests);
    } catch (error) {
      console.error('Failed to fetch guestlist:', error);
    }
  };

  const handleAddGuest = () => {
    if (!newGuest.name.trim()) return;

    const guestToAdd = {
      ...newGuest,
      id: Date.now().toString()
    };

    setGuests([...guests, guestToAdd]);
    setNewGuest({
      id: '',
      name: '',
      phoneNumber: '',
      numberOfGuests: 1,
      side: 'משותף',
      isConfirmed: null,
      notes: ''
    });
    setIsAddingGuest(false);
  };

  const handleEditGuest = (guest: Guest) => {
    if (editingGuestId === guest.id) {
      setGuests(guests.map(g => g.id === guest.id ? guest : g));
      setEditingGuestId(null);
    } else {
      setEditingGuestId(guest.id);
    }
  };

  const handleDeleteGuest = (guestId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק אורח זה?')) {
      setGuests(guests.filter(guest => guest.id !== guestId));
    }
  };

  const handleConfirmGuest = (guestId: string, status: boolean | null) => {
    setGuests(guests.map(guest => 
      guest.id === guestId ? { ...guest, isConfirmed: status } : guest
    ));
  };

  const getGuestStats = () => {
    const confirmed = guests.filter(guest => guest.isConfirmed === true);
    const declined = guests.filter(guest => guest.isConfirmed === false);
    const pending = guests.filter(guest => guest.isConfirmed === null);
    
    const totalGuests = guests.reduce((sum, guest) => sum + guest.numberOfGuests, 0);
    const confirmedGuests = confirmed.reduce((sum, guest) => sum + guest.numberOfGuests, 0);
    
    return {
      totalCount: guests.length,
      confirmedCount: confirmed.length,
      declinedCount: declined.length,
      pendingCount: pending.length,
      totalGuests,
      confirmedGuests
    };
  };

  const filteredGuests = guests
    .filter(guest => {
      // סינון לפי סטטוס
      if (filter === 'confirmed' && guest.isConfirmed !== true) return false;
      if (filter === 'declined' && guest.isConfirmed !== false) return false;
      if (filter === 'pending' && guest.isConfirmed !== null) return false;

      // סינון לפי צד
      if (sideFilter !== 'all' && guest.side !== sideFilter) return false;

      // סינון לפי חיפוש
      if (searchQuery && !guest.name.includes(searchQuery) && !guest.phoneNumber.includes(searchQuery)) return false;

      return true;
    });

  if (!isAuthReady || isLoading) {
    return (
      <>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@300;400;500;700;800&display=swap" rel="stylesheet" />
        </Head>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
          <div className="text-xl text-gray-600">טוען...</div>
        </div>
      </>
    );
  }

  const stats = getGuestStats();

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@300;400;500;700;800&display=swap" rel="stylesheet" />
        <style>{`
          body {
            font-family: 'M PLUS 1p', sans-serif;
          }
        `}</style>
      </Head>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-5xl font-bold text-purple-800 text-center mb-3 font-mplus drop-shadow-sm">
            רשימת המוזמנים לחתונה של
          </h1>
          <h2 className="text-4xl font-bold text-purple-800 text-center mb-12 font-mplus drop-shadow-sm">
            {profile ? `${profile.fullName} ו${profile.partnerName}` : ''}
          </h2>
          
          {/* סיכום סטטיסטי */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalCount}</div>
              <div className="text-gray-600 text-lg">סה&quot;כ אורחים</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.confirmedCount}</div>
              <div className="text-gray-600 text-lg">אישרו הגעה</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-red-600 mb-2">{stats.declinedCount}</div>
              <div className="text-gray-600 text-lg">לא מגיעים</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pendingCount}</div>
              <div className="text-gray-600 text-lg">ממתינים לאישור</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 mb-10">
            <div className="text-2xl font-bold text-gray-800 mb-4 text-center">סיכום מספר האורחים</div>
            <div className="flex flex-col md:flex-row justify-between text-center gap-6">
              <div className="flex-1 p-4 bg-purple-50 rounded-xl">
                <div className="text-4xl font-bold text-purple-600 mb-2">{stats.totalGuests}</div>
                <div className="text-gray-600 text-lg">סה&quot;כ אנשים</div>
              </div>
              <div className="flex-1 p-4 bg-indigo-50 rounded-xl">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{stats.confirmedGuests}</div>
                <div className="text-gray-600 text-lg">אנשים שאישרו</div>
              </div>
            </div>
          </div>

          {/* פקדי סינון */}
          <div className="flex flex-wrap gap-5 mb-10 bg-white p-6 rounded-xl shadow-md">
            <div className="flex-1 min-w-[250px]">
              <input
                type="text"
                placeholder="חיפוש אורח..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'confirmed' | 'declined' | 'pending')}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg min-w-[180px]"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="confirmed">אישרו הגעה</option>
              <option value="declined">לא מגיעים</option>
              <option value="pending">ממתינים לאישור</option>
            </select>
            <select
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value as 'all' | 'חתן' | 'כלה' | 'משותף')}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg min-w-[180px]"
            >
              <option value="all">כל הצדדים</option>
              <option value="חתן">צד החתן</option>
              <option value="כלה">צד הכלה</option>
              <option value="משותף">משותף</option>
            </select>
            <button
              onClick={() => setIsAddingGuest(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center text-lg min-w-[160px] justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              הוסף אורח
            </button>
          </div>

          {/* טבלת האורחים */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                      שם אורח
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                      מספר טלפון
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                      מספר מוזמנים
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                      מהצד של
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                      סטטוס
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                      הערות
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGuests.map(guest => (
                    <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        {editingGuestId === guest.id ? (
                          <input
                            type="text"
                            value={guest.name}
                            onChange={(e) => handleEditGuest({...guest, name: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded text-lg"
                          />
                        ) : (
                          <div className="text-base font-medium text-gray-900">{guest.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {editingGuestId === guest.id ? (
                          <input
                            type="text"
                            value={guest.phoneNumber}
                            onChange={(e) => handleEditGuest({...guest, phoneNumber: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded text-lg"
                          />
                        ) : (
                          <div className="text-base text-gray-600">{guest.phoneNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        {editingGuestId === guest.id ? (
                          <input
                            type="number"
                            min="1"
                            value={guest.numberOfGuests}
                            onChange={(e) => handleEditGuest({...guest, numberOfGuests: parseInt(e.target.value) || 1})}
                            className="w-20 p-2 border border-gray-300 rounded text-center text-lg"
                          />
                        ) : (
                          <div className="text-base text-gray-900 font-medium">{guest.numberOfGuests}</div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        {editingGuestId === guest.id ? (
                          <select
                            value={guest.side}
                            onChange={(e) => handleEditGuest({...guest, side: e.target.value as 'חתן' | 'כלה' | 'משותף'})}
                            className="p-2 border border-gray-300 rounded text-lg"
                          >
                            <option value="חתן">חתן</option>
                            <option value="כלה">כלה</option>
                            <option value="משותף">משותף</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full ${
                            guest.side === 'חתן' ? 'bg-blue-100 text-blue-800' : 
                            guest.side === 'כלה' ? 'bg-pink-100 text-pink-800' : 
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {guest.side}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="grid grid-cols-3 gap-4 w-[160px] mx-auto">
                          <button
                            onClick={() => handleConfirmGuest(guest.id, true)}
                            className={`p-1.5 rounded-full flex items-center justify-center ${guest.isConfirmed === true ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                            title="אישר/ה הגעה"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleConfirmGuest(guest.id, false)}
                            className={`p-1.5 rounded-full flex items-center justify-center ${guest.isConfirmed === false ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                            title="לא מגיע/ה"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleConfirmGuest(guest.id, null)}
                            className={`p-1.5 rounded-full flex items-center justify-center ${guest.isConfirmed === null ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                            title="ממתין/ה לאישור"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {editingGuestId === guest.id ? (
                          <input
                            type="text"
                            value={guest.notes}
                            onChange={(e) => handleEditGuest({...guest, notes: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded text-lg"
                          />
                        ) : (
                          <div className="text-base text-gray-600">{guest.notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        {editingGuestId === guest.id ? (
                          <button 
                            onClick={() => handleEditGuest(guest)} 
                            className="text-green-600 hover:text-green-900 text-lg font-medium"
                          >
                            שמור
                          </button>
                        ) : (
                          <div className="flex justify-center space-x-6">
                            <button 
                              onClick={() => handleEditGuest(guest)} 
                              className="text-indigo-600 hover:text-indigo-900 p-1.5 hover:bg-indigo-100 rounded-full transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteGuest(guest.id)} 
                              className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-100 rounded-full transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* שורה להוספת אורח חדש */}
                  {isAddingGuest && (
                    <tr className="bg-blue-50">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <input
                          type="text"
                          value={newGuest.name}
                          onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                          placeholder="שם האורח"
                          className="w-full p-2 border border-gray-300 rounded text-lg"
                          autoFocus
                        />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <input
                          type="text"
                          value={newGuest.phoneNumber}
                          onChange={(e) => setNewGuest({...newGuest, phoneNumber: e.target.value})}
                          placeholder="מספר טלפון"
                          className="w-full p-2 border border-gray-300 rounded text-lg"
                        />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <input
                          type="number"
                          min="1"
                          value={newGuest.numberOfGuests}
                          onChange={(e) => setNewGuest({...newGuest, numberOfGuests: parseInt(e.target.value) || 1})}
                          className="w-20 p-2 border border-gray-300 rounded text-center text-lg"
                        />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <select
                          value={newGuest.side}
                          onChange={(e) => setNewGuest({...newGuest, side: e.target.value as 'חתן' | 'כלה' | 'משותף'})}
                          className="p-2 border border-gray-300 rounded text-lg"
                        >
                          <option value="חתן">חתן</option>
                          <option value="כלה">כלה</option>
                          <option value="משותף">משותף</option>
                        </select>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="grid grid-cols-3 gap-4 w-[160px] mx-auto">
                          <button
                            onClick={() => setNewGuest({...newGuest, isConfirmed: true})}
                            className={`p-1.5 rounded-full flex items-center justify-center ${newGuest.isConfirmed === true ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                            title="אישר/ה הגעה"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setNewGuest({...newGuest, isConfirmed: false})}
                            className={`p-1.5 rounded-full flex items-center justify-center ${newGuest.isConfirmed === false ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                            title="לא מגיע/ה"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setNewGuest({...newGuest, isConfirmed: null})}
                            className={`p-1.5 rounded-full flex items-center justify-center ${newGuest.isConfirmed === null ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                            title="ממתין/ה לאישור"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <input
                          type="text"
                          value={newGuest.notes}
                          onChange={(e) => setNewGuest({...newGuest, notes: e.target.value})}
                          placeholder="הערות"
                          className="w-full p-2 border border-gray-300 rounded text-lg"
                        />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-6">
                          <button
                            onClick={handleAddGuest}
                            className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setIsAddingGuest(false)}
                            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
