const pool = require('../db/pool');

// Public
const createReservation = async (req, res) => {
  const { customer_name, customer_phone, customer_email, reservation_date, reservation_time, guests_count, special_requests } = req.body;

  if (!customer_name || !customer_phone || !reservation_date || !reservation_time || !guests_count) {
    return res.status(400).json({ error: 'Name, phone, date, time, and guest count are required' });
  }

  if (parseInt(guests_count) < 1 || parseInt(guests_count) > 100) {
    return res.status(400).json({ error: 'Guests count must be between 1 and 100' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reservations (customer_name, customer_phone, customer_email, reservation_date, reservation_time, guests_count, special_requests)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [customer_name, customer_phone, customer_email || null, reservation_date, reservation_time, parseInt(guests_count), special_requests || null]
    );
    res.status(201).json({ message: 'Reservation submitted successfully!', reservation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin
const getAllReservations = async (req, res) => {
  const { date, status } = req.query;
  try {
    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params = [];
    if (date) { params.push(date); query += ` AND reservation_date = $${params.length}`; }
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    query += ' ORDER BY reservation_date DESC, reservation_time DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateReservationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const result = await pool.query(
      'UPDATE reservations SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reservation not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM reservations WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reservation not found' });
    res.json({ message: 'Reservation deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createReservation, getAllReservations, updateReservationStatus, deleteReservation };
