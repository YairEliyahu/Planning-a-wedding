'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

export default function InvitationsPage() {
  const params = useParams();
  const userId = params?.id as string;
  
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadInvitations();
    }
  }, [userId]);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invitations?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      } else {
        throw new Error('Failed to load invitations');
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
      setError('שגיאה בטעינת ההזמנות');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInvitation = async (invitationId: string) => {
    if (!confirm('האם אתם בטוחים שברצונכם למחוק את ההזמנה? פעולה זו לא ניתנת לביטול.')) {
      return;
    }

    try {
      const response = await fetch(`/api/invitations?id=${invitationId}&userId=${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      } else {
        throw new Error('Failed to delete invitation');
      }
    } catch (error) {
      console.error('Error deleting invitation:', error);
      alert('שגיאה במחיקת ההזמנה');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-700', text: 'טיוטה' },
      saved: { color: 'bg-blue-100 text-blue-700', text: 'נשמרה' },
      sent: { color: 'bg-green-100 text-green-700', text: 'נשלחה' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} font-[var(--font-heebo)]`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-[var(--font-heebo)]">טוען הזמנות...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2 font-[var(--font-heebo)]">שגיאה</h2>
          <p className="text-gray-600 font-[var(--font-heebo)]">{error}</p>
          <button 
            onClick={loadInvitations}
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors font-[var(--font-heebo)]"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 font-[var(--font-heebo)]">ההזמנות שלי</h1>
              <p className="text-gray-600 mt-1 font-[var(--font-heebo)]">
                נמצאו {invitations.length} הזמנות
              </p>
            </div>
            
            <Link
              href="../"
              className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-[var(--font-heebo)]"
            >
              + יצירת הזמנה חדשה
            </Link>
          </div>
        </div>

        {invitations.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2 font-[var(--font-heebo)]">עדיין לא יצרתם הזמנות</h2>
            <p className="text-gray-500 mb-6 font-[var(--font-heebo)]">התחילו ליצור את ההזמנה המושלמת לחתונה שלכם</p>
            <Link
              href="../"
              className="inline-block px-8 py-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-[var(--font-heebo)]"
            >
              יצירת הזמנה ראשונה
            </Link>
          </div>
        ) : (
          /* Invitations Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations.map((invitation) => (
              <motion.div
                key={invitation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Invitation Preview */}
                <div 
                  className="h-48 relative p-4 flex flex-col justify-center text-center"
                  style={{
                    background: invitation.backgroundColor,
                    color: invitation.textColor,
                    fontFamily: `var(--font-${invitation.fontFamily.toLowerCase()}), sans-serif`
                  }}
                >
                  <div className="text-2xl font-bold mb-2" style={{ color: invitation.accentColor }}>
                    {invitation.brideName} ♡ {invitation.groomName}
                  </div>
                  <div className="text-sm opacity-80">{invitation.date}</div>
                  <div className="text-xs opacity-70">{invitation.venue}</div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(invitation.status)}
                  </div>
                </div>

                {/* Invitation Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 font-[var(--font-heebo)]">
                        {invitation.brideName} ו{invitation.groomName}
                      </h3>
                      <p className="text-sm text-gray-600 font-[var(--font-heebo)]">
                        {invitation.date} בשעה {invitation.time}
                      </p>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-[var(--font-heebo)]">
                    <span>📤 נשלחה ל-{invitation.sentCount} אורחים</span>
                    <span>📅 {formatDate(invitation.updatedAt)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/user/${userId}/invitations/edit?template=${invitation.templateId}&invitationId=${invitation.id}`}
                      className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-md text-sm text-center hover:bg-blue-600 transition-colors font-[var(--font-heebo)]"
                    >
                      ✏️ ערוך
                    </Link>
                    
                    <button
                      onClick={() => {
                        const url = `/invitation/${invitation.id}`;
                        navigator.clipboard.writeText(window.location.origin + url);
                        alert('קישור ההזמנה הועתק ללוח');
                      }}
                      className="flex-1 bg-green-500 text-white py-2 px-3 rounded-md text-sm hover:bg-green-600 transition-colors font-[var(--font-heebo)]"
                    >
                      🔗 שתף
                    </button>
                    
                    <button
                      onClick={() => deleteInvitation(invitation.id)}
                      className="bg-red-500 text-white py-2 px-3 rounded-md text-sm hover:bg-red-600 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {invitations.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 font-[var(--font-heebo)]">פעולות מהירות</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="../"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl">➕</div>
                <div>
                  <div className="font-medium text-gray-800 font-[var(--font-heebo)]">הזמנה חדשה</div>
                  <div className="text-sm text-gray-600 font-[var(--font-heebo)]">התחילו ליצור הזמנה חדשה</div>
                </div>
              </Link>
              
              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-2xl">📊</div>
                <div>
                  <div className="font-medium text-gray-800 font-[var(--font-heebo)]">סטטיסטיקות</div>
                  <div className="text-sm text-gray-600 font-[var(--font-heebo)]">צפו בנתוני השליחה</div>
                </div>
              </button>
              
              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-2xl">📋</div>
                <div>
                  <div className="font-medium text-gray-800 font-[var(--font-heebo)]">ייצוא נתונים</div>
                  <div className="text-sm text-gray-600 font-[var(--font-heebo)]">הורידו את כל ההזמנות</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 