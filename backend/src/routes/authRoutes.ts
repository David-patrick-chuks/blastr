import { Router } from 'express';
import { getProfile, updateProfile, signup, login, logout, initiateOAuth, handleOAuthCallback } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/signup', signup as any);
router.post('/login', login as any);
router.post('/logout', authenticate as any, logout as any);
router.get('/oauth/:provider', initiateOAuth as any);
router.post('/oauth/callback', handleOAuthCallback as any);

router.get('/profile', authenticate as any, getProfile as any);
router.patch('/profile', authenticate as any, updateProfile as any);

export default router;
