import { Router } from 'express';
import { getAgents, createAgent, getAgentById, updateAgent, deleteAgent, getAgentHealth } from '../controllers/agentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { updateIntegrationConfig } from '../controllers/integrationController.js';

const router = Router();

router.get('/', authenticate as any, getAgents as any);
router.post('/', authenticate as any, createAgent as any);
router.get('/:id', authenticate as any, getAgentById as any);
router.patch('/:id', authenticate as any, updateAgent as any);
router.delete('/:id', authenticate as any, deleteAgent as any);
router.get('/:id/health', authenticate as any, getAgentHealth as any);

router.post('/connect/config', authenticate as any, updateIntegrationConfig as any);

export default router;
