const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store active connections
const activeConnections = new Map();

io.on('connection', (socket) => {
  const { userId, sharedEventId } = socket.handshake.query;
  
  console.log(`🔌 User ${userId} connected with shared event ${sharedEventId}`);
  
  // Store connection info
  activeConnections.set(socket.id, { 
    userId: userId, 
    sharedEventId: sharedEventId 
  });

  // Join shared event room if available
  if (sharedEventId) {
    socket.join(`event-${sharedEventId}`);
    console.log(`👥 User ${userId} joined event room ${sharedEventId}`);
  }

  // Handle user updates
  socket.on('user-update', (event) => {
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
  socket.on('join-event', (data) => {
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

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log('🔌 Ready for real-time partner synchronization');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔌 Shutting down Socket.IO server...');
  httpServer.close(() => {
    console.log('🔌 Socket.IO server closed');
    process.exit(0);
  });
}); 