import { Request, Response } from 'express';
import { env } from '../config/env.js';
import { emailService } from '../services/emailService.js';

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

export const testSMTPConnection = async (req: Request, res: Response) => {
    const { host, port, user, pass } = req.body;

    if (!host || !port || !user || !pass) {
        return res.status(400).json({ error: 'Missing SMTP configuration fields' });
    }

    try {
        const success = await emailService.verifyConnection({ host, port: parseInt(port), user, pass });
        if (success) {
            res.json({ success: true, message: 'SMTP connection verified successfully' });
        } else {
            res.status(400).json({ success: false, error: 'Failed to connect to SMTP server' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
