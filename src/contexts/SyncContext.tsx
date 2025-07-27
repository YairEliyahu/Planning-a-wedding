'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { socketManager, SyncEvent } from '@/lib/socket';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface SyncContextType {
  isConnected: boolean;
  lastSync: Date | null;
  emitUpdate: (type: SyncEvent['type'], action: SyncEvent['action'], data: any) => void;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

interface SyncProviderProps {
  children: React.ReactNode;
  userId: string;
}

export function SyncProvider({ children, userId }: SyncProviderProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>('disconnected');
  const lastSyncRef = useRef<Date | null>(null);

  // פונקציה לשליחת עדכונים לפרטנר
  const emitUpdate = useCallback((type: SyncEvent['type'], action: SyncEvent['action'], data: any) => {
    if (isConnected && user?.sharedEventId) {
      socketManager.emit('user-update', {
        type,
        action,
        data,
        userId,
        sharedEventId: user.sharedEventId,
        timestamp: Date.now()
      });
    }
  }, [isConnected, user?.sharedEventId, userId]);

  // פונקציה לעדכון cache בהתאם לסוג העדכון
  const handlePartnerUpdate = useCallback((event: SyncEvent) => {
    console.log('🔄 Handling partner update:', event);
    lastSyncRef.current = new Date();

    // Use sharedEventId if exists, otherwise fallback to userId
    const effectiveId = user?.sharedEventId || userId;

    // הצג הודעה למשתמש
    const actionText = {
      add: 'הוספה',
      update: 'עדכון',
      delete: 'מחיקה',
      refresh: 'רענון'
    }[event.action];

    const typeText = {
      guests: 'אורחים',
      checklist: 'רשימת משימות',
      seating: 'סידור הושבה',
      preferences: 'העדפות'
    }[event.type];

    toast.success(`${actionText} ${typeText} מהפרטנר`, {
      duration: 3000,
      icon: '🔄',
      style: {
        background: '#10B981',
        color: 'white',
        fontSize: '14px'
      }
    });

    // עדכן את ה-cache בהתאם לסוג העדכון
    switch (event.type) {
      case 'guests':
        queryClient.invalidateQueries({ queryKey: ['guests', effectiveId] });
        break;
      case 'checklist':
        queryClient.invalidateQueries({ queryKey: ['weddingChecklist', effectiveId] });
        break;
      case 'seating':
        queryClient.invalidateQueries({ queryKey: ['seating', effectiveId] });
        break;
      case 'preferences':
        queryClient.invalidateQueries({ queryKey: ['userProfile', effectiveId] });
        queryClient.invalidateQueries({ queryKey: ['weddingPreferences', effectiveId] });
        break;
    }
  }, [queryClient, userId, user?.sharedEventId]);

  useEffect(() => {
    if (user && user.sharedEventId) {
      console.log(`🔌 Setting up real-time sync for user ${userId} with shared event ${user.sharedEventId}`);
      setConnectionStatus('connecting');

      // התחבר ל-WebSocket
      socketManager.connect(userId, user.sharedEventId);

      // האזן לשינויים במצב החיבור
      const checkConnection = () => {
        const connected = socketManager.getConnectionStatus();
        setIsConnected(connected);
        setConnectionStatus(connected ? 'connected' : 'disconnected');
      };

      // בדוק מצב חיבור כל שנייה
      const connectionInterval = setInterval(checkConnection, 1000);

      // האזן לעדכונים מהפרטנר
      socketManager.on('partner-update', handlePartnerUpdate);

      // האזן לחיבור מחדש
      socketManager.on('connect', () => {
        console.log('🔌 Sync connection established');
        setIsConnected(true);
        setConnectionStatus('connected');
      });

      socketManager.on('disconnect', () => {
        console.log('🔌 Sync connection lost');
        setIsConnected(false);
        setConnectionStatus('disconnected');
      });

      socketManager.on('connect_error', () => {
        console.error('🔌 Sync connection error');
        setConnectionStatus('error');
      });

      return () => {
        clearInterval(connectionInterval);
        socketManager.off('partner-update');
        socketManager.off('connect');
        socketManager.off('disconnect');
        socketManager.off('connect_error');
        socketManager.disconnect();
      };
    } else {
      console.log('🔌 No shared event, skipping real-time sync');
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }
  }, [user, userId, handlePartnerUpdate]);

  // Debug: Log connection status changes
  useEffect(() => {
    console.log(`🔌 Sync connection status: ${connectionStatus}`);
  }, [connectionStatus]);

  const value: SyncContextType = {
    isConnected,
    lastSync: lastSyncRef.current,
    emitUpdate,
    connectionStatus
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
} 