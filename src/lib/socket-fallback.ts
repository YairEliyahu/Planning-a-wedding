// Socket.io Fallback for Vercel deployment
// This provides a graceful fallback when Socket.io is not available

export interface SyncEvent {
  type: 'guests' | 'checklist' | 'seating' | 'preferences';
  action: 'add' | 'update' | 'delete' | 'refresh';
  data: any;
  userId: string;
  sharedEventId?: string;
  timestamp: number;
}

class SocketFallbackManager {
  private userId: string | null = null;
  private sharedEventId: string | null = null;
  private isConnected: boolean = false;
  private listeners: { [key: string]: ((data: SyncEvent) => void)[] } = {};
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastPollTime: number = 0;

  connect(userId: string, sharedEventId?: string) {
    console.log('🔌 Socket.io not available, using fallback mode');
    this.userId = userId;
    this.sharedEventId = sharedEventId || null;
    this.isConnected = true;
    
    // סימולציה של התחברות מוצלחת
    setTimeout(() => {
      this.triggerEvent('connect', {} as SyncEvent);
    }, 100);

    // התחל polling אם יש shared event (לסנכרון עם פרטנר)
    if (sharedEventId) {
      this.startPolling();
    }
  }

  private startPolling() {
    if (this.pollingInterval) return;
    
    // Poll כל 30 שניות לעדכונים
    this.pollingInterval = setInterval(async () => {
      await this.checkForUpdates();
    }, 30000);
  }

  private async checkForUpdates() {
    if (!this.sharedEventId) return;

    try {
      // בדוק עדכונים אחרונים מהשרת
      const response = await fetch(`/api/sync/check-updates?sharedEventId=${this.sharedEventId}&since=${this.lastPollTime}`);
      
      if (response.ok) {
        const updates = await response.json();
        
        updates.forEach((update: SyncEvent) => {
          this.triggerEvent('partner-update', update);
        });
        
        this.lastPollTime = Date.now();
      }
    } catch (error) {
      console.warn('🔌 Polling update check failed:', error);
    }
  }

  emit(event: string, data: SyncEvent) {
    if (!this.isConnected) {
      console.warn('🔌 Socket not connected, storing update locally');
      return;
    }

    if (!this.userId) {
      console.warn('🔌 No userId available for emit');
      return;
    }

    const eventData = {
      ...data,
      userId: this.userId,
      sharedEventId: this.sharedEventId || undefined,
      timestamp: Date.now()
    };
    
    console.log(`📤 Fallback: Storing ${event} for later sync:`, eventData);
    
    // במקום emit מיידי, שמור את העדכון לסנכרון מאוחר יותר
    this.storeUpdateForSync(eventData);
  }

  private async storeUpdateForSync(eventData: SyncEvent) {
    if (!this.sharedEventId || !this.userId) return;

    try {
      // שלח עדכון לשרת עבור הפרטנר
      await fetch('/api/sync/store-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...eventData,
          userId: this.userId // Ensure userId is not null
        })
      });
    } catch (error) {
      console.warn('🔌 Failed to store update for sync:', error);
    }
  }

  on(event: string, callback: (data: SyncEvent) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback?: (data: SyncEvent) => void) {
    if (callback && this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    } else {
      delete this.listeners[event];
    }
  }

  private triggerEvent(event: string, data: SyncEvent) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  disconnect() {
    console.log('🔌 Disconnecting fallback socket');
    this.isConnected = false;
    this.userId = null;
    this.sharedEventId = null;
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.listeners = {};
  }
}

export const socketFallbackManager = new SocketFallbackManager(); 