import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import aiRoutes from './routes/aiRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

import { authenticate } from './middlewares/authMiddleware.js';

import { createServer } from 'http';
import { initSocket } from './services/socketService.js';
import { restoreConnections } from './services/connectionRestoreService.js';

const app = express();
const server = createServer(app);

// Initialize Socket.io
initSocket(server);

// Restore saved connections
restoreConnections().catch(err => console.error('Connection restore failed:', err));

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/agents', authenticate as any, agentRoutes);
app.use('/api/chat', authenticate as any, chatRoutes);
app.use('/api/documents', authenticate as any, documentRoutes);
app.use('/api/stats', analyticsRoutes); // System stats might stay public or have separate auth
app.use('/api/settings', settingsRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

const PORT = env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`GAIA Kernel active on port ${PORT}`);
});
