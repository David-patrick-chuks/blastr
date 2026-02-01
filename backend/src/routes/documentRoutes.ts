import { Router } from 'express';
import multer from 'multer';
import { uploadDocument, getDocuments, deleteDocumentHandler, clearKnowledgeHandler, getDocumentLogs } from '../controllers/documentController.js';
import { trainFromYoutube, trainFromWebsite } from '../controllers/trainController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authenticate as any, upload.single('file'), uploadDocument as any);
router.post('/youtube', authenticate as any, trainFromYoutube as any);
router.post('/website', authenticate as any, trainFromWebsite as any);

// Retrieve and manage documents
router.get('/', authenticate as any, getDocuments as any);
router.get('/logs', authenticate as any, getDocumentLogs as any);
router.delete('/:id', authenticate as any, deleteDocumentHandler as any);
router.post('/clear', authenticate as any, clearKnowledgeHandler as any);

export default router;
