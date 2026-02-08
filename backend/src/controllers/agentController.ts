import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { pool } from '../config/db.js';
import { logger } from '../utils/logger.js';
import nodemailer from 'nodemailer';

export const createAgent = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { name, email, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, from_name } = req.body;

    try {
        logger.info(`[AGENT] Creating agent for user: ${userId}`);

        const result = await pool.query(
            `INSERT INTO agents (user_id, name, email, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, from_name, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'unverified')
             RETURNING *`,
            [userId, name, email, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, from_name]
        );

        const agent = result.rows[0];
        logger.info(`[AGENT] Created agent: ${agent.id}`);

        res.status(201).json(agent);
    } catch (error: any) {
        logger.error('[AGENT] Create error:', error.message || error);
        res.status(500).json({ error: 'Failed to create agent' });
    }
};

export const getAgents = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    try {
        const result = await pool.query(
            `SELECT id, user_id, name, email, smtp_host, smtp_port, smtp_secure, smtp_user, from_name, 
                    status, last_verified_at, daily_sent_count, daily_limit, 
                    (daily_limit - daily_sent_count) as quota_remaining,
                    created_at, updated_at
             FROM agents 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error: any) {
        logger.error('[AGENT] Get agents error:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
};

export const getAgent = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM agents WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        logger.error('[AGENT] Get agent error:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch agent' });
    }
};

export const updateAgent = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, email, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, from_name } = req.body;

    try {
        const result = await pool.query(
            `UPDATE agents 
             SET name = $1, email = $2, smtp_host = $3, smtp_port = $4, smtp_secure = $5, 
                 smtp_user = $6, smtp_pass = $7, from_name = $8, status = 'unverified', updated_at = CURRENT_TIMESTAMP
             WHERE id = $9 AND user_id = $10
             RETURNING *`,
            [name, email, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, from_name, id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        logger.info(`[AGENT] Updated agent: ${id}`);
        res.json(result.rows[0]);
    } catch (error: any) {
        logger.error('[AGENT] Update error:', error.message || error);
        res.status(500).json({ error: 'Failed to update agent' });
    }
};

export const deleteAgent = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM agents WHERE id = $1 AND user_id = $2 RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        logger.info(`[AGENT] Deleted agent: ${id}`);
        res.json({ message: 'Agent deleted successfully' });
    } catch (error: any) {
        logger.error('[AGENT] Delete error:', error.message || error);
        res.status(500).json({ error: 'Failed to delete agent' });
    }
};

export const verifyAgent = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    try {
        const agentResult = await pool.query(
            `SELECT * FROM agents WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (agentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        const agent = agentResult.rows[0];
        logger.info(`[AGENT] Verifying SMTP for agent: ${agent.id}`);
        logger.info(`[AGENT] Transport config - Host: ${agent.smtp_host}, Port: ${agent.smtp_port}, Secure: ${agent.smtp_secure}`);
        logger.info(`[AGENT] Credentials - User: "${agent.smtp_user}", Pass: "${agent.smtp_pass}"`);

        const transporter = nodemailer.createTransport({
            host: agent.smtp_host,
            port: agent.smtp_port,
            secure: agent.smtp_secure,
            auth: {
                user: agent.smtp_user,
                pass: agent.smtp_pass,
            },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 15000,
        });

        await transporter.verify();

        await pool.query(
            `UPDATE agents SET status = 'active', last_verified_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id]
        );

        logger.info(`[AGENT] SMTP verification successful for agent: ${agent.id}`);
        res.json({ success: true, message: 'SMTP connection verified successfully' });
    } catch (error: any) {
        logger.error('[AGENT] SMTP verification failed:', error.message || error);

        await pool.query(
            `UPDATE agents SET status = 'failed' WHERE id = $1`,
            [id]
        );

        res.status(400).json({
            success: false,
            error: 'SMTP verification failed',
            details: error.message
        });
    }
};

export const getAgentStats = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT id, name, email, status, daily_sent_count, daily_limit, 
                    (daily_limit - daily_sent_count) as quota_remaining,
                    ROUND((daily_sent_count::numeric / daily_limit::numeric) * 100, 2) as quota_percentage,
                    last_verified_at, last_reset_at
             FROM agents 
             WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        logger.error('[AGENT] Get stats error:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch agent stats' });
    }
};

export const checkAgentAvailability = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT id, name, status, daily_sent_count, daily_limit, 
                    (daily_limit - daily_sent_count) as quota_remaining
             FROM agents 
             WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        const agent = result.rows[0];
        const isAvailable = agent.status === 'active' && agent.quota_remaining > 0;

        res.json({
            available: isAvailable,
            quota_remaining: agent.quota_remaining,
            status: agent.status,
            reason: !isAvailable ? (agent.status !== 'active' ? 'Agent not active' : 'Daily quota exceeded') : null
        });
    } catch (error: any) {
        logger.error('[AGENT] Check availability error:', error.message || error);
        res.status(500).json({ error: 'Failed to check agent availability' });
    }
};
