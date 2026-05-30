const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const DB_FILE = path.join(__dirname, 'swot-data.db');
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database(DB_FILE, err => {
  if (err) {
    console.error('Unable to open database:', err);
    process.exit(1);
  }
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) return reject(err);
    resolve(this);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows);
  });
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS swot_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/swot', async (req, res) => {
  try {
    const rows = await all('SELECT category, content FROM swot_entries ORDER BY id');
    const data = {};

    rows.forEach(row => {
      if (!data[row.category]) {
        data[row.category] = [];
      }
      data[row.category].push(row.content);
    });

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unable to read SWOT data from database.' });
  }
});

app.post('/api/swot', async (req, res) => {
  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Request body must be valid JSON.' });
  }

  const categories = Object.keys(data);

  try {
    await run('BEGIN TRANSACTION');
    await run('DELETE FROM swot_entries');

    for (const category of categories) {
      const items = data[category];
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        if (typeof item !== 'string' || item.trim() === '') continue;
        await run('INSERT INTO swot_entries (category, content) VALUES (?, ?)', [category, item.trim()]);
      }
    }

    await run('COMMIT');
    return res.json({ status: 'saved' });
  } catch (err) {
    console.error(err);
    await run('ROLLBACK').catch(() => {});
    return res.status(500).json({ error: 'Unable to save SWOT data to database.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
