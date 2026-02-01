import { Router } from 'express';
import { chatWithAgent } from '../controllers/chatController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticate as any, chatWithAgent as any);

export default router;
