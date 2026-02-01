import { Router } from 'express';
import { generate, extractEmails } from '../controllers/aiController.js';

const router = Router();

router.post('/generate', generate);
router.post('/extract-emails', extractEmails);

export default router;
