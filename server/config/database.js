import sqlite3 from 'sqlite3';
import fs from 'fs';

const DB_PATH = './databases/main.db';

// Create database if not exists
if (!fs.existsSync(DB_PATH)) {
  // Create folder if not exists
  fs.mkdirSync('./databases', { recursive: true });

  // write a utf8 file
  fs.writeFileSync(DB_PATH, '', { encoding: 'utf8' });
}

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create tables if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    rfid INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    preferences TEXT NOT NULL DEFAULT ('{}')
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS billings (
    username TEXT PRIMARY KEY UNIQUE NOT NULL,
    currentBalance INTEGER  NOT NULL DEFAULT (0),
    lockedBalance INTEGER  NOT NULL DEFAULT (0),
    totalSpent INTEGER  NOT NULL DEFAULT (0),
    totalPrints INTEGER  NOT NULL DEFAULT (0),
    createdAt DATETIME NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS queue (
    printId INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    filename TEXT NOT NULL,
    fileId TEXT NOT NULL,
    uploadedAt DATETIME NOT NULL,
    bill INTEGER NOT NULL,
    pages INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS terminals (
    terminalId TEXT PRIMARY KEY UNIQUE NOT NULL,
    authKey TEXT NOT NULL,
    name TEXT NOT NULL,
    printer TEXT NOT NULL,
    location TEXT,
    endpoint TEXT NOT NULL,
    ssid TEXT NOT NULL,
    password TEXT NOT NULL,
    updateFlag INTEGER DEFAULT (1) NOT NULL,
    lastPing DATETIME NOT NULL DEFAULT (0),
    lastPrint DATETIME NOT NULL DEFAULT (0),
    status INTEGER  DEFAULT (0) NOT NULL,
    comment TEXT,
    data TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS history (
    printId INTEGER PRIMARY KEY NOT NULL UNIQUE,
    terminalId TEXT NOT NULL,
    username TEXT NOT NULL,
    filename TEXT NOT NULL,
    fileId TEXT NOT NULL,
    uploadedAt DATETIME NOT NULL,
    printedAt DATETIME NOT NULL,
    pages INTEGER NOT NULL,
    bill INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY UNIQUE NOT NULL,
    value TEXT NOT NULL
  )`);

  // Insert default values for config table
  const configValues = [
    { key: 'PRINT_COST', value: '10' },
    { key: 'ADMIN_KEY', value: 'admin' },
  ];

  configValues.forEach((config) => {
    db.run(`INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)`, [config.key, config.value]);
  });
});

export default db;
