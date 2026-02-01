import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email?: string;
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
        let user = null;
        let lastError: any = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            attempts++;
            try {
                const { data, error } = await supabase.auth.getUser(token);
                if (!error && data.user) {
                    user = data.user;
                    break;
                }
                lastError = error;
                if (error?.message && !error.message.includes('fetch failed') && !error.message.includes('SocketError')) {
                    // If it's a real auth error (e.g. invalid token), don't retry
                    break;
                }
                logger.warn(`Auth attempt ${attempts} failed: ${error?.message}. Retrying...`);
                await new Promise(resolve => setTimeout(resolve, 500 * attempts)); // Simple backoff
            } catch (err: any) {
                lastError = err;
                logger.warn(`Auth attempt ${attempts} caught error: ${err.message}. Retrying...`);
                await new Promise(resolve => setTimeout(resolve, 500 * attempts));
            }
        }

        if (!user) {
            logger.error('Authentication failed after retries:', lastError?.message || 'User not found');
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = {
            id: user.id,
            email: user.email as string,
        };

        next();
    } catch (err: any) {
        logger.error('Unexpected auth error:', err.message || err);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};
