import { Router } from 'express';
import authenticate from '../middleware/auth.js';
import {
  upload,
  handleFile,
  getCost,
  updateFilePriority,
  deleteFile,
  getPrintingHistory,
  getCurrentQueue,
} from '../controllers/printing.js';

const router = Router();

router.post('/upload', authenticate, upload.single('file'), handleFile);
router.get('/cost', authenticate, getCost);
router.get('/queue', authenticate, getCurrentQueue);
router.post('/update', authenticate, updateFilePriority);
router.post('/delete', authenticate, deleteFile);
router.get('/history', authenticate, getPrintingHistory);

export default router;
