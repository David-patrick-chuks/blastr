import { Router } from 'express';
import { getCampaignStats, getSystemOverview, getRealtimeStats, getActivityLogs } from '../controllers/analyticsController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/overview', authenticate as any, getSystemOverview as any);
router.get('/realtime', authenticate as any, getRealtimeStats as any);
router.get('/activity', authenticate as any, getActivityLogs as any);
router.get('/campaign/:id', authenticate as any, getCampaignStats as any);

export default router;
