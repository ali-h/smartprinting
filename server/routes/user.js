import { Router } from 'express';
import authenticate from '../middleware/auth.js';
import { generateToken } from '../utils/token.js';
import {
  getUser,
  matchPassword,
  getBillingAccount,
  createUser,
  validateRegistration,
  resetPassword,
  updateUser,
} from '../controllers/users.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await getUser(username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordMatch = await matchPassword(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken({ id: user.id, username: user.username });
  res.json({ token });
});

router.post('/register', async (req, res) => {
  const { username, rfid, name, mobile, email, password } = req.body;

  const validationResult = await validateRegistration(username, rfid, name, mobile, email, password);
  if (!validationResult.valid) {
    return res.status(400).json({ message: validationResult.message });
  }

  try {
    const result = await createUser(username, rfid, name, mobile, email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

router.get('/profile', authenticate, async (req, res) => {
  const user = await getUser(req.user.username);
  const billingInfo = await getBillingAccount(req.user.username);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!billingInfo) {
    return res.status(404).json({ message: 'Billing info not found' });
  }

  res.json({ user, billingInfo });
});

export default router;
