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

  try {
    await pool.query(`ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS media_type VARCHAR(10) DEFAULT 'image'`);
  } catch (err) {
    console.error('Migration add media_type failed:', err.message);
  }

  try {
    // Remove gallery records that have broken local file paths (not Cloudinary URLs)
    const { rowCount: galleryDeleted } = await pool.query(
      "DELETE FROM gallery_photos WHERE photo_url IS NOT NULL AND photo_url NOT LIKE 'http%'"
    );
    // Null out broken local photo URLs on other tables (keep the records)
    const { rowCount: eventsCleared } = await pool.query(
      "UPDATE events SET photo_url = NULL WHERE photo_url IS NOT NULL AND photo_url NOT LIKE 'http%'"
    );
    const { rowCount: menuCleared } = await pool.query(
      "UPDATE menu_items SET photo_url = NULL WHERE photo_url IS NOT NULL AND photo_url NOT LIKE 'http%'"
    );
    const { rowCount: modelsCleared } = await pool.query(
      "UPDATE models SET photo_url = NULL WHERE photo_url IS NOT NULL AND photo_url NOT LIKE 'http%'"
    );
    if (galleryDeleted || eventsCleared || menuCleared || modelsCleared) {
      console.log(`Cleanup: removed ${galleryDeleted} broken gallery records, cleared photo_url on ${eventsCleared} events, ${menuCleared} menu items, ${modelsCleared} models.`);
    }
  } catch (err) {
    console.error('Cleanup of broken image paths failed:', err.message);
  }
}

module.exports = initDb;
