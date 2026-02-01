import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { pool } from '../config/db.js';
import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export const signup = async (req: Request, res: Response) => {
    const { email, password, full_name } = req.body;
    logger.info(`[SIGNUP] Request received for email: ${email}`);

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            logger.error(`[SIGNUP] Supabase signup failed: ${error.message}`);
            return res.status(error.status || 400).json({ error: error.message });
        }
        if (!data.user) {
            logger.error('[SIGNUP] No user returned from Supabase');
            return res.status(400).json({ error: 'Signup failed' });
        }

        // Create profile
        await pool.query(
            'INSERT INTO profiles (id, full_name, preferences) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
            [data.user.id, full_name || '', JSON.stringify({})]
        );
        logger.info(`[SIGNUP] Profile created for user: ${data.user.id}`);


        const sanitized = {
            user: {
                id: data.user.id,
                email: data.user.email,
            },
            session: {
                access_token: data.session?.access_token,
                refresh_token: data.session?.refresh_token,
                expires_at: data.session?.expires_at,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                }
            }
        };

        logger.info(`[SIGNUP] Success for user: ${data.user.id}`);
        res.status(201).json(sanitized);
    } catch (error: any) {
        logger.error('[SIGNUP] Error:', error.message || error);
        res.status(500).json({ error: 'Internal server error during signup' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    logger.info(`[LOGIN] Request received for email: ${email}`);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            logger.error(`[LOGIN] Supabase login failed: ${error.message}`);
            return res.status(error.status || 400).json({ error: error.message });
        }
        if (!data.user || !data.session) {
            logger.error('[LOGIN] No user/session returned from Supabase');
            return res.status(400).json({ error: 'Login failed' });
        }

        const sanitized = {
            user: {
                id: data.user?.id,
                email: data.user?.email,
            },
            session: {
                access_token: data.session?.access_token,
                refresh_token: data.session?.refresh_token,
                expires_at: data.session?.expires_at,
                user: {
                    id: data.user?.id,
                    email: data.user?.email,
                }
            }
        };

        logger.info(`[LOGIN] Success for user: ${data.user.id}`);
        res.json(sanitized);
    } catch (error: any) {
        logger.error('[LOGIN] Error:', error.message || error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
};

export const logout = async (req: AuthRequest, res: Response) => {
    try {
        // In a token-based system with Supabase direct client, logout is mostly frontend.
        // But we can call signout here if we tracking sessions on backend.
        const { error } = await supabase.auth.signOut();
        if (error) return res.status(400).json({ error: error.message });
        res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
        logger.error('Logout error:', error.message || error);
        res.status(500).json({ error: 'Internal server error during logout' });
    }
};

export const initiateOAuth = async (req: Request, res: Response) => {
    const { provider } = req.params;
    const { redirectTo } = req.query;
    logger.info(`[OAUTH] Initiate request for provider: ${provider}`);

    if (provider !== 'google') {
        logger.error(`[OAUTH] Unsupported provider: ${provider}`);
        return res.status(400).json({ error: 'Unsupported OAuth provider' });
    }

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider as any,
            options: {
                redirectTo: (redirectTo as string) || 'http://localhost:5173/auth/callback'
            }
        });

        if (error) {
            logger.error(`[OAUTH] Supabase OAuth failed: ${error.message}`);
            return res.status(400).json({ error: error.message });
        }
        logger.info(`[OAUTH] OAuth URL generated for ${provider}`);
        res.json({ url: data.url });
    } catch (error: any) {
        logger.error('[OAUTH] Error:', error.message || error);
        res.status(500).json({ error: 'Internal server error during OAuth initiation' });
    }
};

export const handleOAuthCallback = async (req: Request, res: Response) => {
    const { access_token } = req.body;
    logger.info('[OAUTH_CALLBACK] Request received');

    if (!access_token) {
        logger.error('[OAUTH_CALLBACK] No access token provided');
        return res.status(400).json({ error: 'Access token required' });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(access_token);

        if (error || !user) {
            logger.error(`[OAUTH_CALLBACK] Failed to get user: ${error?.message}`);
            return res.status(401).json({ error: 'Invalid token' });
        }

        logger.info(`[OAUTH_CALLBACK] User authenticated: ${user.id}, email: ${user.email}`);

        // Auto-provision profile if it doesn't exist
        await pool.query(
            'INSERT INTO profiles (id, full_name, email, preferences) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET email = $3',
            [user.id, user.user_metadata?.full_name || user.email?.split('@')[0] || '', user.email, JSON.stringify({})]
        );
        logger.info(`[OAUTH_CALLBACK] Profile provisioned for user: ${user.id}`);

        const sanitized = {
            user: {
                id: user.id,
                email: user.email,
            },
            session: {
                access_token: access_token,
                user: {
                    id: user.id,
                    email: user.email,
                }
            }
        };

        logger.info(`[OAUTH_CALLBACK] Success for user: ${user.id}`);
        res.json(sanitized);
    } catch (error: any) {
        logger.error('[OAUTH_CALLBACK] Error:', error.message || error);
        res.status(500).json({ error: 'Internal server error during OAuth callback' });
    }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    try {
        const result = await pool.query('SELECT * FROM profiles WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            // Profile might not exist yet if it's a first-time login
            // We can return a default or create one here.
            // For now, let's just return a template.
            return res.json({
                id: userId,
                email: req.user?.email,
                full_name: '',
                avatar_url: '',
                preferences: {}
            });
        }

        res.json({
            ...result.rows[0],
            email: req.user?.email as string // Include email from JWT
        });
    } catch (error: any) {
        logger.error('Error fetching profile:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { full_name, avatar_url, preferences } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO profiles (id, full_name, avatar_url, preferences) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (id) DO UPDATE 
             SET full_name = EXCLUDED.full_name, 
                 avatar_url = EXCLUDED.avatar_url, 
                 preferences = EXCLUDED.preferences,
                 updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [userId, full_name, avatar_url, JSON.stringify(preferences || {})]
        );

        res.json(result.rows[0]);
    } catch (error: any) {
        logger.error('Error updating profile:', error.message || error);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
};
