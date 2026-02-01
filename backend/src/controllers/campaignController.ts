import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { pool } from '../config/db.js';
import { logger } from '../utils/logger.js';

export const getCampaigns = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    try {
        const result = await pool.query(
            `SELECT c.*, a.name as agent_name, a.email as agent_email, a.status as agent_status
             FROM campaigns c
             LEFT JOIN agents a ON c.agent_id = a.id
             WHERE c.user_id = $1 
             ORDER BY c.created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error: any) {
        logger.error('[CAMPAIGN] Get campaigns error:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
};

export const getCampaign = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT c.*, a.name as agent_name, a.email as agent_email
             FROM campaigns c
             LEFT JOIN agents a ON c.agent_id = a.id
             WHERE c.id = $1 AND c.user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        logger.error('[CAMPAIGN] Get campaign error:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch campaign' });
    }
};

export const createCampaign = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { name, subject, template, system_instruction, agent_id } = req.body;

    try {
        if (!agent_id) {
            return res.status(400).json({ error: 'Agent ID is required' });
        }

        const agentCheck = await pool.query(
            `SELECT id, status, daily_sent_count, daily_limit FROM agents WHERE id = $1 AND user_id = $2`,
            [agent_id, userId]
        );

        if (agentCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        const agent = agentCheck.rows[0];
        if (agent.status !== 'active') {
            return res.status(400).json({ error: 'Selected agent is not active. Please verify SMTP connection first.' });
        }

        const result = await pool.query(
            `INSERT INTO campaigns (user_id, agent_id, name, subject, template, system_instruction, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'Draft')
             RETURNING *`,
            [userId, agent_id, name, subject, template, system_instruction]
        );

        logger.info(`[CAMPAIGN] Created campaign: ${result.rows[0].id} with agent: ${agent_id}`);
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        logger.error('[CAMPAIGN] Create error:', error.message || error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
};

export const updateCampaign = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, subject, template, system_instruction, agent_id, status } = req.body;

    try {
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (subject !== undefined) {
            updates.push(`subject = $${paramIndex++}`);
            values.push(subject);
        }
        if (template !== undefined) {
            updates.push(`template = $${paramIndex++}`);
            values.push(template);
        }
        if (system_instruction !== undefined) {
            updates.push(`system_instruction = $${paramIndex++}`);
            values.push(system_instruction);
        }
        if (agent_id !== undefined) {
            updates.push(`agent_id = $${paramIndex++}`);
            values.push(agent_id);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            values.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        values.push(id, userId);
        const sql = `UPDATE campaigns SET ${updates.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`;

        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        logger.info(`[CAMPAIGN] Updated campaign: ${id}`);
        res.json(result.rows[0]);
    } catch (error: any) {
        logger.error('[CAMPAIGN] Update error:', error.message || error);
        res.status(500).json({ error: 'Failed to update campaign' });
    }
};

export const deleteCampaign = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        logger.info(`[CAMPAIGN] Deleted campaign: ${id}`);
        res.json({ message: 'Campaign deleted successfully' });
    } catch (error: any) {
        logger.error('[CAMPAIGN] Delete error:', error.message || error);
        res.status(500).json({ error: 'Failed to delete campaign' });
    }
};

export const getCampaignStats = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT c.*, a.name as agent_name, a.email as agent_email,
                    COUNT(r.id) as total_recipients,
                    COUNT(CASE WHEN r.status = 'Sent' THEN 1 END) as sent_count,
                    COUNT(CASE WHEN r.status = 'Failed' THEN 1 END) as failed_count
             FROM campaigns c
             LEFT JOIN agents a ON c.agent_id = a.id
             LEFT JOIN recipients r ON c.id = r.campaign_id
             WHERE c.id = $1 AND c.user_id = $2
             GROUP BY c.id, a.name, a.email`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        logger.error('[CAMPAIGN] Get stats error:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch campaign stats' });
    }
};
