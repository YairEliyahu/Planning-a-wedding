'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useSearchParams } from 'next/navigation';

interface InvitationData {
  id: string;
  groomName: string;
  brideName: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  message: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  backgroundPattern: string;
  templateId: string;
  logoStyle: string;
  logoLetters: string;
  logoFont: string;
  logoColor: string;
  logoShape: string;
  logoSize: string;
  status: 'draft' | 'saved' | 'sent';
  sentCount: number;
  lastSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PublicInvitationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const invitationId = params?.id as string;
  const guestId = searchParams?.get('guest');
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<'pending' | 'confirmed' | 'declined'>('pending');
  const [guestName, setGuestName] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [dietary, setDietary] = useState('');
  const [notes, setNotes] = useState('');
  const [showRsvp, setShowRsvp] = useState(false);

  useEffect(() => {
    if (invitationId) {
      loadInvitation();
    }
  }, [invitationId]);

  const loadInvitation = async () => {
    try {
      setIsLoading(true);
      // In a real app, you'd have a public API endpoint for invitations
      // For now, we'll simulate loading
      
      // This is a mock invitation for demonstration
      const mockInvitation: InvitationData = {
        id: invitationId,
        groomName: 'דוד',
        brideName: 'שרה',
        date: '15 באוגוסט 2024',
        time: '19:00',
        venue: 'גני אירועים חלומות',
        address: 'רח׳ הפרחים 123, תל אביב',
        message: 'בשמחה רבה אנו מזמינים אתכם לחגוג איתנו את יום החתונה שלנו!',
        backgroundColor: 'linear-gradient(135deg, #fefefe 0%, #f8fafc 50%, #f1f5f9 100%)',
        textColor: '#1f2937',
        accentColor: '#d4af37',
        fontFamily: 'Playfair Display',
        backgroundPattern: 'pearl-shimmer',
        templateId: 'pearl-paper',
        logoStyle: 'elegant-circle',
        logoLetters: 'ש❤ד',
        logoFont: 'Playfair Display',
        logoColor: '#d4af37',
        logoShape: 'circle',
        logoSize: 'medium',
        status: 'sent',
        sentCount: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setInvitation(mockInvitation);
    } catch (error) {
      console.error('Error loading invitation:', error);
      setError('שגיאה בטעינת ההזמנה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRsvp = async (status: 'confirmed' | 'declined') => {
    try {
      // Here you would send the RSVP to the server
      console.log('RSVP submitted:', {
        invitationId,
        guestId,
        status,
        guestName,
        guestCount,
        dietary,
        notes
      });

      setRsvpStatus(status);
      alert(status === 'confirmed' ? 'תודה על האישור! נשמח לראות אתכם' : 'תודה על העדכון');
      setShowRsvp(false);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('שגיאה בשליחת האישור. אנא נסו שוב.');
    }
  };

  const generateBackgroundPattern = (pattern: string) => {
    // Same function as in the editor
    switch (pattern) {
      case 'pearl-shimmer':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'30\' height=\'30\' viewBox=\'0 0 30 30\'%3E%3Ccircle cx=\'15\' cy=\'15\' r=\'1.5\' fill=\'rgba(255,255,255,0.6)\' opacity=\'0.8\'/%3E%3Ccircle cx=\'8\' cy=\'8\' r=\'1\' fill=\'rgba(248,250,252,0.5)\'/%3E%3Ccircle cx=\'22\' cy=\'22\' r=\'0.8\' fill=\'rgba(241,245,249,0.4)\'/%3E%3C/svg%3E")';
      default:
        return 'none';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-[var(--font-heebo)]">טוען הזמנה...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">💔</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2 font-[var(--font-heebo)]">הזמנה לא נמצאה</h2>
          <p className="text-gray-600 font-[var(--font-heebo)]">
            {error || 'ההזמנה שביקשתם לא קיימת או הוסרה'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Invitation */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden relative"
          style={{
            background: invitation.backgroundColor,
            backgroundImage: generateBackgroundPattern(invitation.backgroundPattern),
            backgroundSize: '40px 40px, 25px 25px, 60px 60px, 100% 100%',
            color: invitation.textColor,
            fontFamily: `var(--font-${invitation.fontFamily.toLowerCase()}), sans-serif`
          }}
        >
          <div className="p-8 md:p-12 text-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8"
            >
              <div 
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-2xl font-bold border-4"
                style={{ 
                  backgroundColor: invitation.logoColor,
                  color: '#ffffff',
                  borderColor: invitation.accentColor
                }}
              >
                {invitation.logoLetters}
              </div>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: invitation.accentColor }}>
                {invitation.brideName} ♡ {invitation.groomName}
              </h1>
              <p className="text-xl md:text-2xl opacity-90">מתחתנים!</p>
            </motion.div>

            {/* Event Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="space-y-6 mb-8"
            >
              <div className="text-2xl font-semibold">{invitation.date}</div>
              <div className="text-xl">{invitation.time}</div>
              
              <div 
                className="border-t border-b py-6 mx-8"
                style={{ borderColor: invitation.accentColor + '30' }}
              >
                <div className="text-xl font-medium mb-2">{invitation.venue}</div>
                <div className="text-lg opacity-80">{invitation.address}</div>
              </div>
            </motion.div>

            {/* Personal Message */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mb-8"
            >
              <p className="text-lg leading-relaxed opacity-90 max-w-lg mx-auto">
                {invitation.message}
              </p>
            </motion.div>

            {/* Decorative Element */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="text-3xl mb-8"
              style={{ color: invitation.accentColor }}
            >
              ✨ ♡ ✨
            </motion.div>

            {/* RSVP Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
            >
              {rsvpStatus === 'pending' ? (
                <button
                  onClick={() => setShowRsvp(true)}
                  className="bg-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-pink-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 font-[var(--font-heebo)]"
                >
                  📝 אישור הגעה
                </button>
              ) : (
                <div className="text-center">
                  <div 
                    className="inline-block px-6 py-3 rounded-full text-lg font-semibold text-white"
                    style={{ 
                      backgroundColor: rsvpStatus === 'confirmed' ? '#10b981' : '#ef4444'
                    }}
                  >
                    {rsvpStatus === 'confirmed' ? '✅ מגיעים!' : '❌ לא מגיעים'}
                  </div>
                  <p className="text-sm mt-2 opacity-75 font-[var(--font-heebo)]">
                    תודה על העדכון
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Additional Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="mt-8 flex justify-center gap-4"
        >
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('קישור ההזמנה הועתק ללוח');
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-[var(--font-heebo)]"
          >
            🔗 שתף הזמנה
          </button>
          
          <button
            onClick={() => {
              const event = new Date(`${invitation.date} ${invitation.time}`);
              const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${invitation.brideName}+ו${invitation.groomName}+מתחתנים&dates=${event.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&location=${invitation.venue}&details=${invitation.message}`;
              window.open(calendarUrl, '_blank');
            }}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-[var(--font-heebo)]"
          >
            📅 הוסף ליומן
          </button>
        </motion.div>
      </div>

      {/* RSVP Modal */}
      {showRsvp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4 text-center font-[var(--font-heebo)]">
              אישור הגעה
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">
                  שם מלא
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg font-[var(--font-heebo)]"
                  placeholder="הכניסו את שמכם המלא"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">
                  מספר מוזמנים
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg font-[var(--font-heebo)]"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'אורח' : 'אורחים'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">
                  הגבלות תזונתיות (אופציונלי)
                </label>
                <input
                  type="text"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg font-[var(--font-heebo)]"
                  placeholder="למשל: צמחוני, ללא גלוטן"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">
                  הערות נוספות (אופציונלי)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg font-[var(--font-heebo)]"
                  placeholder="הערות או בקשות מיוחדות"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleRsvp('confirmed')}
                disabled={!guestName.trim()}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-[var(--font-heebo)]"
              >
                ✅ מגיעים!
              </button>
              
              <button
                onClick={() => handleRsvp('declined')}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors font-[var(--font-heebo)]"
              >
                ❌ לא מגיעים
              </button>
            </div>

            <button
              onClick={() => setShowRsvp(false)}
              className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 transition-colors font-[var(--font-heebo)]"
            >
              ביטול
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
} 