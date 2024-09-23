import jwt from 'jsonwebtoken';

const AUTH_SECRET = process.env.AUTH_SECRET || 'Terminator1605';

export const generateToken = (payload) => {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: '3d' });
};

export const verifyToken = (token) => {
  return jwt.verify(token, AUTH_SECRET);
};
