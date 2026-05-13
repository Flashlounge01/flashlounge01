const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./pool');

async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(schema);
    console.log('Database schema initialized.');
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    throw err;
  }

  try {
    const email = process.env.ADMIN_EMAIL || 'flashloungeandsuite@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'Flash001@';
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [email, hash, 'Flash Lounge Admin']
    );
    console.log('Admin seed complete.');
  } catch (err) {
    console.error('Admin seed failed:', err.message);
    throw err;
  }
}

module.exports = initDb;
