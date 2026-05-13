const pool = require('../db/pool');
const path = require('path');

// Public
const getMenuItems = async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM menu_items WHERE is_available = true';
    const params = [];
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    query += ' ORDER BY category, name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category FROM menu_items WHERE is_available = true ORDER BY category'
    );
    res.json(result.rows.map((r) => r.category));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin
const getAllMenuItems = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items ORDER BY category, name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createMenuItem = async (req, res) => {
  const { name, description, price, category } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }
  try {
    const photoUrl = req.file ? req.file.path : null;
    const result = await pool.query(
      `INSERT INTO menu_items (name, description, price, category, photo_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, parseFloat(price), category, photoUrl]
    );
    console.log(`Menu item created: ${name}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createMenuItem error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, is_available } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM menu_items WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Item not found' });

    const photoUrl = req.file ? req.file.path : existing.rows[0].photo_url;
    const result = await pool.query(
      `UPDATE menu_items SET name=$1, description=$2, price=$3, category=$4, photo_url=$5, is_available=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [
        name || existing.rows[0].name,
        description ?? existing.rows[0].description,
        price ? parseFloat(price) : existing.rows[0].price,
        category || existing.rows[0].category,
        photoUrl,
        is_available !== undefined ? is_available : existing.rows[0].is_available,
        id,
      ]
    );
    console.log(`Menu item updated: ${id}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateMenuItem error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM menu_items WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    console.log(`Menu item deleted: ${id}`);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('deleteMenuItem error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getMenuItems, getCategories, getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem };
