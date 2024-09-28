import { Router } from 'express';
import { ping, update, scan } from '../controllers/terminal.js';

const router = Router();

// Log every request
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log(req.body);
  
  next();
});

router.post('/ping', ping);
router.post('/update', update);
router.post('/scan', scan);

export default router;

