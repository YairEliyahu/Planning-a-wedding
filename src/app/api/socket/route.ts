import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { SyncEvent } from '@/lib/socket';

// Store active connections
const activeConnections = new Map<string, { userId: string; sharedEventId?: string }>();

export async function GET(_req: NextRequest) {
  // This is a placeholder for the WebSocket upgrade
  // The actual WebSocket handling will be done in the Socket.IO server
  return new Response('WebSocket endpoint', { status: 200 });
}

export async function POST(_req: NextRequest) {
  // This is a placeholder for the WebSocket upgrade
  // The actual WebSocket handling will be done in the Socket.IO server
  return new Response('WebSocket endpoint', { status: 200 });
}

// Initialize Socket.IO server
let io: SocketIOServer;

if (!(global as any).io && process.env.NODE_ENV !== 'production') {
  try {
    const port = parseInt(process.env.SOCKET_PORT || '3001');
    io = new SocketIOServer(port, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  (global as any).io = io;

  io.on('connection', (socket) => {
    const { userId, sharedEventId } = socket.handshake.query;
    
    console.log(`🔌 User ${userId} connected with shared event ${sharedEventId}`);
    
    // Store connection info
    activeConnections.set(socket.id, { 
      userId: userId as string, 
      sharedEventId: sharedEventId as string 
    });

    // Join shared event room if available
    if (sharedEventId) {
      socket.join(`event-${sharedEventId}`);
      console.log(`👥 User ${userId} joined event room ${sharedEventId}`);
    }

    // Handle user updates
    socket.on('user-update', (event: SyncEvent) => {
      console.log(`📤 User ${userId} sent update:`, event);
      
      // Broadcast to all users in the same shared event (except sender)
      if (event.sharedEventId) {
        socket.to(`event-${event.sharedEventId}`).emit('partner-update', {
          ...event,
          fromUserId: userId
        });
        console.log(`📥 Broadcasted update to event ${event.sharedEventId}`);
      }
    });

    // Handle joining specific event
    socket.on('join-event', (data: { sharedEventId: string; userId: string }) => {
      socket.join(`event-${data.sharedEventId}`);
      console.log(`👥 User ${data.userId} joined event ${data.sharedEventId}`);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`🔌 User ${userId} disconnected: ${reason}`);
      activeConnections.delete(socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`🔌 Socket error for user ${userId}:`, error);
    });
  });

    console.log(`🚀 Socket.IO server initialized on port ${process.env.SOCKET_PORT || '3001'}`);
  } catch (error) {
    console.error('❌ Failed to initialize Socket.IO server:', error);
  }
} 