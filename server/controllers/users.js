import db from '../config/database.js';
import { isUsernameValid } from '../utils/username.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/token.js';

export async function matchPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function getUser(username) {
  const user = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
  return user;
}

export async function getUserBy(value, column) {
  const user = await new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE ${column} = ?`, [value], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
  return user;
}

export async function getBillingAccount(username) {
  const billingInfo = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM billings WHERE username = ?', [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
  return billingInfo;
}

export async function createUser(username, rfid, name, mobile, email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const createdAt = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
  
  // Create user
  await new Promise((resolve, reject) => {
    db.run('INSERT INTO users (username, rfid, name, mobile, email, password) VALUES (?, ?, ?, ?, ?, ?)', 
      [username, rfid, name, mobile, email, hashedPassword], 
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });

  // Create billing account
  await new Promise((resolve, reject) => {
    db.run('INSERT INTO billings (username, createdAt) VALUES (?, ?)', [username, createdAt], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return { message: 'User created successfully' };
}

// Validate registration
export async function validateRegistration(username, rfid, name, mobile, email, password) {
  if (!username || !rfid || !name || !mobile || !email || !password) {
    return { valid: false, message: 'All fields are required' };
  }

  if (!isUsernameValid(username)) {
    return { valid: false, message: 'Username is not valid' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  if (name.length < 3) {
    return { valid: false, message: 'Name must be at least 3 characters' };
  }

  if (mobile.length < 10) {
    return { valid: false, message: 'Mobile must be at least 10 characters' };
  }

  if (!email.includes('@')) {
    return { valid: false, message: 'Email is not valid' };
  }

  // Check if username already exists
  const user = await getUser(username);
  if (user) {
    return { valid: false, message: 'Username already exists' };
  }

  // Check if RFID already exists
  const rfidUser = await getUserBy(rfid, 'rfid');
  if (rfidUser) {
    return { valid: false, message: 'RFID already exists' };
  }

  // Check if mobile already exists
  const mobileUser = await getUserBy(mobile, 'mobile');
  if (mobileUser) {
    return { valid: false, message: 'Mobile already exists' };
  }

  // Check if email already exists
  const emailUser = await getUserBy(email, 'email');
  if (emailUser) {
    return { valid: false, message: 'Email already exists' };
  }

  return { valid: true };
}

// Reset password
export async function resetPassword(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await new Promise((resolve, reject) => {
    db.run('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Update user
export async function updateUser(username, rfid, name, mobile, email) {
  await new Promise((resolve, reject) => {
    db.run('UPDATE users SET rfid = ?, name = ?, mobile = ?, email = ? WHERE username = ?', [rfid, name, mobile, email, username], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export const loginUser = async (req, res) => {
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
};

export const registerUser = async (req, res) => {
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
};

export const getPendingPrints = async (username) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT COUNT(*) as count FROM queue WHERE username = ?', [username], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows[0].count);
      }
    });
  });
};

export const getUserProfile = async (req, res) => {
  const user = await getUser(req.user.username);
  const billingInfo = await getBillingAccount(req.user.username);
  const pendingPrints = await getPendingPrints(req.user.username);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!billingInfo) {
    return res.status(404).json({ message: 'Billing info not found' });
  }

  res.json({ ...user, ...billingInfo, pendingPrints });
};
