import { Router } from 'express';
import authenticate from '../middleware/auth.js';
import {
  upload,
  handleFile,
  getCost,
  deleteFile,
  getPrintingHistory,
  getCurrentQueue,
  downloadFile,
  getAllTerminals,
} from '../controllers/api.js';

const router = Router();

router.post('/upload', authenticate, upload.single('file'), handleFile);
router.get('/cost', authenticate, getCost);
router.get('/queue', authenticate, getCurrentQueue);
router.post('/delete', authenticate, deleteFile);
router.get('/history', authenticate, getPrintingHistory);
router.get('/download/:fileId', downloadFile); // Removed authentication middleware
router.get('/terminals', authenticate, getAllTerminals); // Add this new route

export default router;
