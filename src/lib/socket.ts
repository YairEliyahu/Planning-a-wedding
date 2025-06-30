import { io, Socket } from 'socket.io-client';

export interface SyncEvent {
  type: 'guests' | 'checklist' | 'seating' | 'preferences';
  action: 'add' | 'update' | 'delete' | 'refresh';
  data: any;
  userId: string;
  sharedEventId?: string;
  timestamp: number;
}

class SocketManager {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private sharedEventId: string | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  connect(userId: string, sharedEventId?: string) {
    if (this.socket?.connected) {
      console.log('🔌 Socket already connected');
      return;
    }

    this.userId = userId;
    this.sharedEventId = sharedEventId || null;
    
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    this.socket = io(socketUrl, {
      query: {
        userId,
        sharedEventId: sharedEventId || ''
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Connected to real-time server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join the shared event room if available
      if (this.sharedEventId && this.socket) {
        this.socket.emit('join-event', { 
          sharedEventId: this.sharedEventId,
          userId: this.userId 
        });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from real-time server:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('🔌 Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔌 Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔌 Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔌 Reconnection failed');
    });
  }

  emit(event: string, data: SyncEvent) {
    if (this.socket && this.isConnected) {
      const eventData = {
        ...data,
        userId: this.userId,
        sharedEventId: this.sharedEventId,
        timestamp: Date.now()
      };
      
      console.log(`📤 Emitting ${event}:`, eventData);
      this.socket.emit(event, eventData);
    } else {
      console.warn('🔌 Socket not connected, cannot emit event');
    }
  }

  on(event: string, callback: (data: SyncEvent) => void) {
    if (this.socket) {
      this.socket.on(event, (data: SyncEvent) => {
        console.log(`📥 Received ${event}:`, data);
        callback(data);
      });
    }
  }

  off(event: string, callback?: (data: SyncEvent) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
      this.sharedEventId = null;
    }
  }
}

export const socketManager = new SocketManager(); 