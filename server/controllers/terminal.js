import db from '../config/database.js';
import pdfToPrinter from 'pdf-to-printer';
import fs from 'fs/promises';
import path from 'path';

// Universal function for terminal authentication
const authenticateTerminal = (terminalId, authKey) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM terminals WHERE terminalId = ? AND authKey = ?';
    const params = [terminalId, authKey];

    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Error in terminal authentication:', err);
        reject(new Error('Internal server error'));
      } else if (!row) {
        reject(new Error('Invalid terminal or auth key'));
      } else {
        resolve(row);
      }
    });
  });
};

const UPLOAD_DIR = 'uploads';

const printFile = async (fileId, printerName) => {
  try {
    // Construct the file path
    const filePath = path.join(UPLOAD_DIR, fileId);

    // Print the file
    const options = {
      printer: printerName,
    };

    await pdfToPrinter.print(filePath, options);

    return { success: true };
  } catch (error) {
    console.error('Error in printFile:', error);
    return { success: false, error: error.message };
  }
};

export const ping = async (req, res) => {
  const { terminalId, authKey } = req.body;
  const currentTime = Math.floor(Date.now() / 1000);

  try {
    const row = await authenticateTerminal(terminalId, authKey);

    // Update lastPing in the database
    const updateSql = 'UPDATE terminals SET lastPing = ? WHERE terminalId = ?';
    const updateParams = [currentTime, terminalId];

    db.run(updateSql, updateParams, (updateErr) => {
      if (updateErr) {
        console.error('Error updating lastPing:', updateErr);
        return res.status(500).json({ error: 'Error updating lastPing' });
      }

      // Prepare the response
      const response = { 
        updateFlag: row.updateFlag,
        lastPing: currentTime
      };

      // If updateFlag is 1, include all data except terminalId
      if (row.updateFlag === 1) {
        const { terminalId, ...otherData } = row;
        Object.assign(response, otherData, { lastPing: currentTime });
      }

      // Return the response
      return res.status(200).json(response);
    });
  } catch (error) {
    if (error.message === 'Invalid terminal or auth key') {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req, res) => {
  const { terminalId, authKey, settings } = req.body;
  const currentTime = Math.floor(Date.now() / 1000);

  try {
    const row = await authenticateTerminal(terminalId, authKey);

    // Compare received settings with database data
    let allMatch = true;
    for (const [key, value] of Object.entries(settings)) {
      if (row[key] !== value) {
        allMatch = false;
        break;
      }
    }

    const newUpdateFlag = allMatch ? 0 : 1;

    // Update the updateFlag and lastPing in the database
    const updateSql = 'UPDATE terminals SET updateFlag = ?, lastPing = ? WHERE terminalId = ?';
    const updateParams = [newUpdateFlag, currentTime, terminalId];

    db.run(updateSql, updateParams, (updateErr) => {
      if (updateErr) {
        console.error('Error updating updateFlag and lastPing:', updateErr);
        return res.status(500).json({ error: 'Error updating terminal data' });
      }

      return res.status(200).json({ 
        updateFlag: newUpdateFlag,
        lastPing: currentTime,
      });
    });
  } catch (error) {
    if (error.message === 'Invalid terminal or auth key') {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const scan = async (req, res) => {
  const { terminalId, authKey, rfid } = req.body;
  const currentTime = Math.floor(Date.now() / 1000);

  try {
    // Authenticate terminal
    const terminal = await authenticateTerminal(terminalId, authKey);

    // Check if terminal status is 1 (active)
    if (terminal.status !== 1) {
      return res.status(403).json({ error: 'Terminal is not active' });
    }

    // Match RFID with username and get the first queued file with all its info
    const sql = `
      SELECT q.*, u.username
      FROM users u
      JOIN queue q ON u.username = q.username
      WHERE u.rfid = ?
      ORDER BY q.uploadedAt ASC
      LIMIT 1
    `;

    db.get(sql, [rfid], async (err, row) => {
      if (err) {
        console.error('Error in scan query:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'No matching user or queued file found' });
      }

      // Call the print function
      const printResult = await printFile(row.fileId, terminal.printer);

      if (printResult.success) {
        // Start a transaction
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');

          try {
            // Move the file from queue to history
            const insertHistorySql = `
              INSERT INTO history (printId, terminalId, username, filename, fileId, uploadedAt, printedAt, pages, bill)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.run(insertHistorySql, [
              row.printId, terminalId, row.username, row.filename, row.fileId,
              row.uploadedAt, currentTime, row.pages, row.bill
            ]);

            // Update billing
            const updateBillingSql = `
              UPDATE billings
              SET lockedBalance = lockedBalance - ?,
                  totalSpent = totalSpent + ?,
                  totalPrints = totalPrints + 1
              WHERE username = ?
            `;
            db.run(updateBillingSql, [row.bill, row.bill, row.username]);

            // Remove the file from the queue
            const deleteQueueSql = 'DELETE FROM queue WHERE printId = ?';
            db.run(deleteQueueSql, [row.printId]);

            // Update terminal's lastPrint
            const updateTerminalSql = 'UPDATE terminals SET lastPrint = ? WHERE terminalId = ?';
            db.run(updateTerminalSql, [currentTime, terminalId]);

            // Commit the transaction
            db.run('COMMIT', (commitErr) => {
              if (commitErr) {
                console.error('Error committing transaction:', commitErr);
                return res.status(500).json({ error: 'Error updating database after print' });
              }
              return res.status(200).json({ 
                message: 'Print job completed successfully',
                file: row
              });
            });
          } catch (error) {
            db.run('ROLLBACK', (rollbackErr) => {
              if (rollbackErr) {
                console.error('Error rolling back transaction:', rollbackErr);
              }
              console.error('Error updating database after print:', error);
              return res.status(500).json({ error: 'Error updating database after print' });
            });
          }
        });
      } else {
        return res.status(500).json({ error: 'Print job failed', details: printResult.error });
      }
    });
  } catch (error) {
    if (error.message === 'Invalid terminal or auth key') {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
