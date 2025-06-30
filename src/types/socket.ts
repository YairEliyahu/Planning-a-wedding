import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export interface SyncEvent {
  type: 'guests' | 'checklist' | 'seating' | 'preferences';
  action: 'add' | 'update' | 'delete' | 'refresh';
  data: any;
  userId: string;
  sharedEventId?: string;
  timestamp: number;
}

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
}

export interface SocketUser {
  userId: string;
  sharedEventId?: string;
  socketId: string;
} 