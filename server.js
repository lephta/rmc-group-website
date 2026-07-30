import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

const dbPath = path.join(__dirname, 'data', 'rmc.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service TEXT,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS recruitment_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    position TEXT,
    message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pest_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    address TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const sanitizeText = (value) => (typeof value === 'string' ? value.trim() : '');

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'RMC API is running' });
});

app.post('/api/forms/contact', (req, res) => {
  const { name, email, service, message, phone } = req.body || {};

  if (!sanitizeText(name) || !sanitizeText(email) || !sanitizeText(message)) {
    return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
  }

  const stmt = db.prepare(`
    INSERT INTO contact_submissions (name, email, phone, service, message)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(sanitizeText(name), sanitizeText(email), sanitizeText(phone), sanitizeText(service), sanitizeText(message));

  res.json({ success: true, message: 'Contact form submitted successfully.' });
});

app.post('/api/forms/recruitment', (req, res) => {
  const { name, email, phone, position, message } = req.body || {};

  if (!sanitizeText(name) || !sanitizeText(email)) {
    return res.status(400).json({ success: false, message: 'Name and email are required.' });
  }

  const stmt = db.prepare(`
    INSERT INTO recruitment_applications (name, email, phone, position, message)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(sanitizeText(name), sanitizeText(email), sanitizeText(phone), sanitizeText(position), sanitizeText(message));

  res.json({ success: true, message: 'Recruitment application saved successfully.' });
});

app.post('/api/forms/pest', (req, res) => {
  const { name, contact, address, date, time } = req.body || {};

  if (!sanitizeText(name) || !sanitizeText(contact) || !sanitizeText(address) || !sanitizeText(date) || !sanitizeText(time)) {
    return res.status(400).json({ success: false, message: 'Please complete all booking fields.' });
  }

  const stmt = db.prepare(`
    INSERT INTO pest_bookings (name, contact, address, date, time)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(sanitizeText(name), sanitizeText(contact), sanitizeText(address), sanitizeText(date), sanitizeText(time));

  res.json({ success: true, message: 'Pest booking saved successfully.' });
});

app.get('/api/admin/submissions', (_req, res) => {
  const contacts = db.prepare('SELECT * FROM contact_submissions ORDER BY id DESC').all();
  const recruitment = db.prepare('SELECT * FROM recruitment_applications ORDER BY id DESC').all();
  const bookings = db.prepare('SELECT * FROM pest_bookings ORDER BY id DESC').all();

  res.json({ contacts, recruitment, bookings });
});

app.listen(PORT, () => {
  console.log(`RMC API listening on http://localhost:${PORT}`);
});
