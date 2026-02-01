import { Router } from 'express';
import { getAgentStats, getSystemOverview, getRealtimeStats, getActivityLogs } from '../controllers/analyticsController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/agents/:id', authenticate as any, getAgentStats as any);
router.get('/overview', authenticate as any, getSystemOverview as any);
router.get('/realtime', authenticate as any, getRealtimeStats as any);
router.get('/activity', authenticate as any, getActivityLogs as any);

export default router;
