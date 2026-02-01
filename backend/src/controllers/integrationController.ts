import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

const syncIntegration = async (agentId: string, userId: string, platform: string, status: string, metadata: any = {}) => {
    try {
        await pool.query(
            'UPDATE agents SET integrations = integrations || jsonb_build_object($1::text, $2::jsonb) WHERE id = $3 AND user_id = $4',
            [platform, { status, connected_at: new Date().toISOString(), ...metadata }, agentId, userId]
        );
    } catch (e) {
        console.error(`Failed to sync integration state for ${platform}:`, e);
    }
};

export const updateIntegrationConfig = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;
    const { agentId, platform, config } = req.body;

    if (!agentId || !platform || !config) {
        res.status(400).json({ error: 'Agent ID, Platform, and Config are required' });
        return;
    }

    try {
        await pool.query(
            `UPDATE agents 
             SET integrations = jsonb_set(
                integrations, 
                ARRAY[$1::text, 'config'], 
                coalesce(integrations->($1::text)->'config', '{}'::jsonb) || $3::jsonb
             )
             WHERE id = $2 AND user_id = $4`,
            [platform, agentId, config, userId]
        );
        res.json({ message: 'Configuration updated' });
    } catch (error: any) {
        console.error('Failed to update config:', error);
        res.status(500).json({ error: error.message });
    }
};
