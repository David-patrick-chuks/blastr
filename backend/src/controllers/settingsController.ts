import { Request, Response } from 'express';
import { env } from '../config/env.js';

export const getAPIKeysStatus = async (req: Request, res: Response) => {
    try {
        const keys = [env.GEMINI_API_KEY];
        for (let i = 1; i <= 10; i++) {
            const key = process.env[`GEMINI_API_KEY_${i}`];
            if (key) keys.push(key);
        }

        const status = keys.map((key, index) => ({
            id: index + 1,
            name: `Gemini Key ${index + 1}`,
            status: key ? 'Connected' : 'Missing',
            masked: key ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : null,
            isPrimary: index === 0
        }));

        res.json(status);
    } catch (error) {
        console.error('Error fetching API key status:', error);
        res.status(500).json({ error: 'Failed to fetch API key status' });
    }
};
