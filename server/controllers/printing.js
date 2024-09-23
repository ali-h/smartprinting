import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid'; // to generate a unique file id
import multer from 'multer';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { getParam } from '../utils/params.js';
import { getBillingAccount } from './users.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const fileId = uuidv4();
    const originalExtension = path.extname(file.originalname);
    cb(null, `${fileId}${originalExtension}`);
  },
});

const upload = multer({ storage: storage });

export const uploadFile = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // get the original filename and the new UUID-based filename
      const filename = req.file.originalname;
      const fileId = req.file.filename;
      const { username } = req.user;

      // Calculate total pages
      const pdfDocument = await PDFDocument.load(await fs.promises.readFile(filename));
      const totalPages = pdfDocument.getPageCount();

      // Calculate bill
      const PRINT_COST = await getParam('PRINT_COST');
      const bill = totalPages * PRINT_COST;

      // Calculate if user has enough balance
      const billing = await getBillingAccount(username);
      if (billing.currentBalance < bill) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Lock the balance
      let sql = `UPDATE billings SET currentBalance = currentBalance - ?, lockedBalance = lockedBalance + ? WHERE username = ?`;
      let params = [bill, bill, username];
      db.run(sql, params, function (err) {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
      });

      // Insert into database
      sql = `INSERT INTO queue (username, filename, fileId, pages, bill) VALUES (?, ?, ?, ?, ?)`;
      params = [username, filename, fileId, totalPages, bill];
      db.run(sql, params, function (err) {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        return res.status(200).json({ message: 'File uploaded successfully' });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
];

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
