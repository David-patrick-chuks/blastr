import { Router } from 'express';
import {
    getAgents,
    getAgent,
    createAgent,
    updateAgent,
    deleteAgent,
    verifyAgent,
    getAgentStats,
    checkAgentAvailability
} from '../controllers/agentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate as any, getAgents as any);
router.post('/', authenticate as any, createAgent as any);
router.get('/:id', authenticate as any, getAgent as any);
router.patch('/:id', authenticate as any, updateAgent as any);
router.delete('/:id', authenticate as any, deleteAgent as any);
router.post('/:id/verify', authenticate as any, verifyAgent as any);
router.get('/:id/stats', authenticate as any, getAgentStats as any);
router.get('/:id/availability', authenticate as any, checkAgentAvailability as any);

export default router;
