import { Router } from 'express';
import { getAPIKeysStatus } from '../controllers/settingsController.js';

const router = Router();

router.get('/keys', getAPIKeysStatus);

export default router;
