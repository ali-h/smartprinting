import { Router } from 'express';
import { ping, update, scan } from '../controllers/terminal.js';

const router = Router();

router.post('/ping', ping);
router.post('/update', update);
router.post('/scan', scan);

export default router;

