import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export const getCampaignStats = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    try {
        const recipientCountRes = await pool.query('SELECT total_recipients, sent_count FROM campaigns WHERE id = $1 AND user_id = $2', [id, userId]);
        const msgCountRes = await pool.query('SELECT COUNT(*) FROM messages WHERE campaign_id = $1 AND user_id = $2', [id, userId]);
        const tokenRes = await pool.query('SELECT SUM(tokens_used) as total FROM messages WHERE campaign_id = $1 AND user_id = $2', [id, userId]);
        const agentRes = await pool.query('SELECT status, created_at FROM campaigns WHERE id = $1 AND user_id = $2', [id, userId]);

        if (agentRes.rows.length === 0) {
            res.status(404).json({ error: 'Campaign not found' });
            return;
        }

        const agent = agentRes.rows[0];
        const campaign = recipientCountRes.rows[0];
        res.json({
            recipientCount: parseInt(campaign.total_recipients || 0),
            sentCount: parseInt(campaign.sent_count || 0),
            messageCount: parseInt(msgCountRes.rows[0].count),
            tokensUsed: parseInt(tokenRes.rows[0].total || 0),
            status: agent.status,
            activeSince: agent.created_at,
            uptime: '99.9%'
        });
    } catch (error) {
        console.error('Error fetching campaign stats:', error);
        res.status(500).json({ error: 'Failed to fetch campaign stats' });
    }
};

export const getSystemOverview = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
        const campaignCountRes = await pool.query('SELECT COUNT(*) FROM campaigns WHERE user_id = $1', [userId]);
        const recipientCountRes = await pool.query('SELECT SUM(total_recipients) as total FROM campaigns WHERE user_id = $1', [userId]);
        const msgCountRes = await pool.query('SELECT COUNT(*) FROM messages WHERE user_id = $1', [userId]);
        const agentCountRes = await pool.query('SELECT COUNT(*) FROM agents WHERE user_id = $1', [userId]);

        res.json({
            totalCampaigns: parseInt(campaignCountRes.rows[0].count),
            totalRecipients: parseInt(recipientCountRes.rows[0].total || 0),
            totalRequests: parseInt(msgCountRes.rows[0].count),
            totalBots: parseInt(agentCountRes.rows[0].count),
            systemHealth: 'Optimal',
            apiLatency: '< 450ms'
        });
    } catch (error) {
        console.error('Error fetching system overview:', error);
        res.status(500).json({ error: 'Failed to fetch system overview' });
    }
};

export const getRealtimeStats = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
        const sql = `
            SELECT 
                h.hour, 
                COALESCE(m.count, 0) as count
            FROM (
                SELECT generate_series(
                    date_trunc('hour', NOW() - interval '23 hours'), 
                    date_trunc('hour', NOW()), 
                    '1 hour'
                ) as hour
            ) h
            LEFT JOIN (
                SELECT date_trunc('hour', created_at) as hour, COUNT(*) as count
                FROM messages
                WHERE user_id = $1 AND created_at > NOW() - interval '24 hours'
                GROUP BY 1
            ) m ON h.hour = m.hour
            ORDER BY h.hour ASC;
        `;
        const result = await pool.query(sql, [userId]);
        const data = result.rows.map(r => parseInt(r.count));
        res.json(data);
    } catch (error) {
        console.error('Error fetching realtime stats:', error);
        res.status(500).json({ error: 'Failed to fetch realtime stats' });
    }
};

export const getActivityLogs = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
        const result = await pool.query(`
            SELECT a.name as campaign_name, l.action, l.details, l.created_at 
            FROM activity_logs l 
            LEFT JOIN campaigns a ON l.campaign_id = a.id 
            WHERE l.user_id = $1
            ORDER BY l.created_at DESC LIMIT 20
        `, [userId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
};
