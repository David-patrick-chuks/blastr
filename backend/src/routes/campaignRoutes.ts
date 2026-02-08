import { Router } from 'express';
import {
    getCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaignStats,
    addRecipients
} from '../controllers/campaignController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate as any, getCampaigns as any);
router.post('/', authenticate as any, createCampaign as any);
router.get('/:id', authenticate as any, getCampaign as any);
router.patch('/:id', authenticate as any, updateCampaign as any);
router.delete('/:id', authenticate as any, deleteCampaign as any);
router.get('/:id/stats', authenticate as any, getCampaignStats as any);
router.post('/:id/recipients', authenticate as any, addRecipients as any);

export default router;
