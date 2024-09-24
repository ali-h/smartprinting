import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid'; // to generate a unique file id
import multer from 'multer';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { getParam } from '../utils/params.js';
import { getBillingAccount } from './users.js';
import fs from 'fs/promises';

const UPLOAD_DIR = 'uploads';

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    } else {
      throw error;
    }
  }
}

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    await ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const fileId = uuidv4();
    const originalExtension = path.extname(file.originalname);
    cb(null, `${fileId}${originalExtension}`);
  },
});

export const upload = multer({ storage: storage });

export const handleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // get the original filename and the new UUID-based filename
    const filename = req.file.path;
    const fileId = req.file.filename;
    const { username } = req.user;

    // Calculate total pages
    const pdfBytes = await fs.readFile(filename);
    const pdfDocument = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDocument.getPageCount();

    // Calculate bill
    const PRINT_COST = await getParam('PRINT_COST');
    const bill = totalPages * PRINT_COST;

    // Calculate if user has enough balance
    const billing = await getBillingAccount(username);
    if (billing.currentBalance < bill) {
      // Remove the uploaded file if the user doesn't have enough balance
      await fs.unlink(filename);
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Lock the balance
    let sql = `UPDATE billings SET currentBalance = currentBalance - ?, lockedBalance = lockedBalance + ? WHERE username = ?`;
    let params = [bill, bill, username];
    await new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve();
      });
    });

    // Insert into database
    sql = `INSERT INTO queue (username, filename, fileId, pages, bill) VALUES (?, ?, ?, ?, ?)`;
    params = [username, req.file.originalname, fileId, totalPages, bill];
    await new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve();
      });
    });

    return res.status(200).json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error in uploadFile:', error);
    // If an error occurs, try to remove the uploaded file
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error removing file:', unlinkError);
      }
    }
    return res.status(500).json({ message: error.message });
  }
};

export const getCost = async (req, res) => {
  try {
    const PRINT_COST = await getParam('PRINT_COST');
    return res.status(200).json({ cost: parseFloat(PRINT_COST) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching print cost' });
  }
};

export const updateFilePriority = (req, res) => {
  const { fileId, priority } = req.body;
  const { username } = req.user;

  const sql = `UPDATE queue SET priority = ? WHERE fileId = ? AND username = ?`;
  const params = [priority, fileId, username];
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(200).json({ message: 'File priority updated successfully' });
  });
};

export const deleteFile = (req, res) => {
  const { fileId } = req.body;
  const { username } = req.user;

  const sql = `DELETE FROM queue WHERE fileId = ? AND username = ?`;
  const params = [fileId, username];
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(200).json({ message: 'File deleted successfully' });
  });
};

export const getCurrentQueue = (req, res) => {
  const { username } = req.user;

  const sql = `SELECT * FROM queue WHERE username = ?`;
  const params = [username];
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(200).json({ rows });
  });
};

export const getPrintingHistory = (req, res) => {
  const { username } = req.user;

  const sql = `SELECT * FROM history WHERE username = ?`;
  const params = [username];
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(200).json({ rows });
  });
};
