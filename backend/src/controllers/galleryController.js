const pool = require('../db/pool');

// Public
const getGallery = async (req, res) => {
  try {
    const { category } = req.query;
    let query = "SELECT * FROM gallery_photos WHERE photo_url LIKE 'http%'";
    const params = [];
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getGalleryCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT category FROM gallery_photos WHERE photo_url LIKE 'http%' ORDER BY category");
    res.json(result.rows.map((r) => r.category));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin
const uploadPhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Photo file is required' });
  const { caption, category } = req.body;
  try {
    const photoUrl = req.file.path;
    const result = await pool.query(
      'INSERT INTO gallery_photos (photo_url, caption, category) VALUES ($1, $2, $3) RETURNING *',
      [photoUrl, caption || '', category || 'general']
    );
    console.log(`Gallery photo uploaded: ${photoUrl}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('uploadPhoto error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const deletePhoto = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM gallery_photos WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Photo not found' });
    console.log(`Gallery photo deleted: ${id}`);
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    console.error('deletePhoto error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getGallery, getGalleryCategories, uploadPhoto, deletePhoto };
