import { Router } from 'express';
import { getAPIKeysStatus, testSMTPConnection } from '../controllers/settingsController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/keys', getAPIKeysStatus);
router.post('/test-smtp', authenticate as any, testSMTPConnection);

export default router;
