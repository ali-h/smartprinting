import { Router } from 'express';
import authenticate from '../middleware/auth.js';
import {
  uploadFile,
  updateFilePriority,
  deleteFile,
  getPrintingHistory,
  getCurrentQueue,
} from '../controllers/printing.js';

const router = Router();

router.post('/upload', authenticate, uploadFile);
router.get('/queue', authenticate, getCurrentQueue);
router.post('/update', authenticate, updateFilePriority);
router.post('/delete', authenticate, deleteFile);
router.get('/history', authenticate, getPrintingHistory);

export default router;
