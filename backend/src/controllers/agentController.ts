import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { Campaign } from '../types/index.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export const getAgents = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
        const result = await pool.query('SELECT * FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
};

export const createAgent = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { name, role, template, system_instruction } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO campaigns (name, role, template, system_instruction, status, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, role, template, system_instruction, 'Active', userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
};

export const getAgentById = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM campaigns WHERE id = $1 AND user_id = $2', [id, userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Campaign not found' });
            return;
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).json({ error: 'Failed to fetch campaign' });
    }
};

export const updateAgent = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const updates = req.body;

    const allowedUpdates = ['name', 'role', 'template', 'system_instruction', 'status', 'total_recipients', 'sent_count'];
    const fields: string[] = [];
    const values: any[] = [];
    let queryIndex = 1;

    Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
            fields.push(`${key} = $${queryIndex}`);
            values.push(updates[key]);
            queryIndex++;
        }
    });

    if (fields.length === 0) {
        res.status(400).json({ error: 'No valid update fields provided' });
        return;
    }

    // Add updated_at
    fields.push(`updated_at = NOW()`);

    values.push(id, userId);
    const sql = `UPDATE campaigns SET ${fields.join(', ')} WHERE id = $${queryIndex} AND user_id = $${queryIndex + 1} RETURNING *`;

    try {
        const result = await pool.query(sql, values);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Campaign not found' });
            return;
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Failed to update campaign' });
    }
};

export const deleteAgent = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Campaign not found' });
            return;
        }
        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ error: 'Failed to delete campaign' });
    }
};

export const getAgentHealth = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT name, status FROM campaigns WHERE id = $1 AND user_id = $2', [id, userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Campaign not found' });
            return;
        }

        const campaign = result.rows[0];
        res.json({
            status: 'Healthy',
            connectivity: 'Active',
            latency: '120ms',
            lastActivity: new Date().toISOString(),
            name: campaign.name
        });
    } catch (error) {
        console.error('Error checking campaign health:', error);
        res.status(500).json({ error: 'Failed to check campaign health' });
    }
};
