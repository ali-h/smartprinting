import { Router } from 'express';
import authenticate from '../middleware/auth.js';
import {
  loginUser,
  registerUser,
  getUserProfile,
  // updateUserProfile,
  // updateUserPassword,
  // updateUserPreferences,
} from '../controllers/users.js';

const router = Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
// router.post('/update', authenticate, updateUserProfile);
// router.post('/update-password', authenticate, updateUserPassword);
// router.post('/update-preferences', authenticate, updateUserPreferences);
router.get('/profile', authenticate, getUserProfile);

export default router;
