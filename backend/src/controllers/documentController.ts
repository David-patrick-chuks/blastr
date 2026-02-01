import { Request, Response } from 'express';
import { processUpload } from '../services/knowledge/documentService.js';
import { getAgentDocuments, deleteDocument, clearAgentKnowledge } from '../services/knowledge/vectorService.js';
import { logger } from '../utils/logger.js';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { Document } from '../types/index.js';

export const uploadDocument = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { agentId } = req.body;
    const file = req.file;

    if (!agentId || !file) {
        res.status(400).json({ error: 'Agent ID and File are required' });
        return;
    }

    try {
        // Verify agent ownership
        const agentCheck = await pool.query('SELECT id FROM agents WHERE id = $1 AND user_id = $2', [agentId, userId]);
        if (agentCheck.rows.length === 0) {
            res.status(403).json({ error: 'Unauthorized to add knowledge to this agent' });
            return;
        }

        const result = await processUpload(agentId, file, userId as string);
        res.json({ message: 'Document uploaded and indexed', chunks: result.chunks });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { agentId } = req.query;

    if (!agentId) {
        res.status(400).json({ error: 'Agent ID is required' });
        return;
    }

    try {
        const documents = await getAgentDocuments(agentId as string, userId);
        res.json(documents);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteDocumentHandler = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    try {
        await deleteDocument(id, userId);
        res.json({ message: 'Document deleted successfully' });
    } catch (error: any) {
        logger.error('Delete document failed:', error.message || error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
};

export const clearKnowledgeHandler = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { agentId } = req.body;
    try {
        await clearAgentKnowledge(agentId, userId);
        res.json({ success: true, message: 'All agent knowledge cleared' });
    } catch (error: any) {
        logger.error('Clear knowledge failed:', error.message || error);
        res.status(500).json({ error: 'Failed to clear agent knowledge' });
    }
};

export const getDocumentLogs = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { agentId } = req.query;
    try {
        const result = await pool.query(
            'SELECT id, metadata->>\'source\' as source, created_at, content FROM documents WHERE agent_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 10',
            [agentId, userId]
        );

        const logs = result.rows.map((row: any) => ({
            id: row.id,
            timestamp: row.created_at,
            event: `Processed ${row.source || 'document'} chunk`,
            status: 'Success',
            detail: row.content.substring(0, 100) + '...'
        }));

        res.json(logs);
    } catch (error: any) {
        logger.error('Fetch document logs failed:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};
