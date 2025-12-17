import Fastify from 'fastify';
import socketio from 'fastify-socket.io';
import cors from '@fastify/cors';
import { generateDeck } from '@rikka/shared';
import { roomManager } from './RoomManager';
import { registerRoomHandlers } from './handlers/roomHandlers';

const server = Fastify({
  logger: true,
});

const PORT = 4000;

async function bootstrap() {
  // Register CORS
  await server.register(cors, {
    origin: '*', // Allow all for dev, tighten for prod
    methods: ['GET', 'POST'],
  });

  // Register Socket.io
  await server.register(socketio, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', timestamp: Date.now() };
  });

  server.ready(err => {
    if (err) throw err;

    (server as any).io.on('connection', (socket: any) => {
      server.log.info(`Client connected: ${socket.id}`);
      
      registerRoomHandlers((server as any).io, socket);

      socket.on('disconnect', () => {
        server.log.info(`Client disconnected: ${socket.id}`);
      });
    });
  });

  try {
    const deck = generateDeck();
    server.log.info(`Shared logic loaded check: Generated deck with ${deck.length} cards.`);

    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

bootstrap();
