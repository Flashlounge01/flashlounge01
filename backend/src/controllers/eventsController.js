const pool = require('../db/pool');

// Public
const getEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM events WHERE is_active = true AND event_date >= CURRENT_DATE
       ORDER BY event_date, event_time`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin
const getAllEvents = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY event_date DESC, event_time DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createEvent = async (req, res) => {
  const { title, description, event_date, event_time } = req.body;
  if (!title || !event_date || !event_time) {
    return res.status(400).json({ error: 'Title, date, and time are required' });
  }
  try {
    const photoUrl = req.file ? req.file.path : null;
    const result = await pool.query(
      `INSERT INTO events (title, description, event_date, event_time, photo_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, event_date, event_time, photoUrl]
    );
    console.log(`Event created: ${title} on ${event_date}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createEvent error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, event_date, event_time, is_active } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    const e = existing.rows[0];
    const photoUrl = req.file ? req.file.path : e.photo_url;
    const result = await pool.query(
      `UPDATE events SET title=$1, description=$2, event_date=$3, event_time=$4, photo_url=$5, is_active=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [title || e.title, description ?? e.description, event_date || e.event_date, event_time || e.event_time, photoUrl, is_active !== undefined ? is_active : e.is_active, id]
    );
    console.log(`Event updated: ${id}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateEvent error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM events WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    console.log(`Event deleted: ${id}`);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('deleteEvent error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getEvents, getAllEvents, createEvent, updateEvent, deleteEvent };
