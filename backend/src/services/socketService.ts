import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../utils/logger.js';
import { pool } from '../config/db.js';
import { generateContentStream } from './ai/geminiService.js';

let io: Server;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Adjust for production
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        socket.on('join', (room: string) => {
            socket.join(room);
            logger.info(`Socket ${socket.id} joined room: ${room}`);
        });

        socket.on('CHAT_STREAM_REQUEST', async (payload) => {
            const { agentId: campaignId, message, history, userId } = payload;

            try {
                // 1. Verify Ownership & Get System Instruction
                const campaignResult = await pool.query(
                    'SELECT system_instruction FROM campaigns WHERE id = $1 AND user_id = $2',
                    [campaignId, userId]
                );

                if (campaignResult.rows.length === 0) {
                    socket.emit('CHAT_ERROR', { error: 'Unauthorized or Campaign not found' });
                    return;
                }

                const systemInstruction = campaignResult.rows[0].system_instruction;

                // 2. Stream from Gemini
                let fullResponse = '';
                for await (const chunk of generateContentStream(message, {
                    history,
                    systemInstruction
                })) {
                    fullResponse += chunk;
                    socket.emit('CHAT_CHUNK', { agentId: campaignId, chunk });
                }

                socket.emit('CHAT_COMPLETE', { agentId: campaignId });

                // 3. Log the interaction (async)
                const userTokens = Math.ceil(message.length / 4);
                const assistantTokens = Math.ceil(fullResponse.length / 4);

                pool.query(
                    'INSERT INTO messages (campaign_id, role, content, tokens_used, user_id) VALUES ($1, $2, $3, $4, $5)',
                    [campaignId, 'user', message, userTokens, userId]
                ).catch(e => logger.error('Message log failed:', e));

                pool.query(
                    'INSERT INTO messages (campaign_id, role, content, tokens_used, user_id) VALUES ($1, $2, $3, $4, $5)',
                    [campaignId, 'assistant', fullResponse, assistantTokens, userId]
                ).catch(e => logger.error('Response log failed:', e));

            } catch (error: any) {
                logger.error('Socket Chat Error:', error.message || error);
                socket.emit('CHAT_ERROR', { error: 'Failed to process chat stream' });
            }
        });

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

export const SOCKET_EVENTS = {
    CAMPAIGN_STATUS_UPDATE: 'CAMPAIGN_STATUS_UPDATE',
    SYSTEM_ALERT: 'SYSTEM_ALERT',
    CHAT_MESSAGE: 'CHAT_MESSAGE'
};

export const notifyRoom = (room: string, event: string, data: any) => {
    if (io) {
        io.to(room).emit(event, data);
    }
};

export const broadcast = (event: string, data: any) => {
    if (io) {
        io.emit(event, data);
    }
};
