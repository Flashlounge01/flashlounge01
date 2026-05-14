const pool = require('../db/pool');
const mailer = require('../../config/mailer');

const ADMIN_EMAIL = 'flashloungeandsuite@gmail.com';

function buildDetailsHtml(reservation_date, reservation_time, guests_count, special_requests) {
  return `
    <p><strong>Date:</strong> ${reservation_date}</p>
    <p><strong>Time:</strong> ${reservation_time}</p>
    <p><strong>Guests:</strong> ${guests_count}</p>
    ${special_requests ? `<p><strong>Special Requests:</strong> ${special_requests}</p>` : ''}
  `;
}

async function sendAdminEmail({ customer_name, customer_phone, customer_email, reservation_date, reservation_time, guests_count, special_requests }) {
  await mailer.sendMail({
    from: `"Flash Lounge N Suite" <${process.env.GMAIL_USER}>`,
    to: ADMIN_EMAIL,
    subject: `New Reservation - ${customer_name}`,
    html: `
      <h2>New Reservation Submitted</h2>
      <p><strong>Name:</strong> ${customer_name}</p>
      <p><strong>Phone:</strong> ${customer_phone}</p>
      <p><strong>Email:</strong> ${customer_email || 'Not provided'}</p>
      ${buildDetailsHtml(reservation_date, reservation_time, guests_count, special_requests)}
    `,
  });
}

async function sendCustomerEmail({ customer_name, customer_phone, customer_email, reservation_date, reservation_time, guests_count, special_requests }) {
  await mailer.sendMail({
    from: `"Flash Lounge N Suite" <${process.env.GMAIL_USER}>`,
    to: customer_email,
    subject: 'Reservation Confirmed - Flash Lounge N Suite',
    html: `
      <h2>Hi ${customer_name}, your reservation is confirmed!</h2>
      <p>Thank you for choosing Flash Lounge N Suite. We're excited to host you.</p>
      <h3>Your Reservation Details</h3>
      ${buildDetailsHtml(reservation_date, reservation_time, guests_count, special_requests)}
      <p>Our team will call you at <strong>${customer_phone}</strong> to confirm your booking.</p>
      <p>For enquiries, reach us at <strong>07059693068</strong>.</p>
      <br/>
      <p style="color:#888;">Flash Lounge N Suite — Flash Ways</p>
    `,
  });
}

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
    const reservation = result.rows[0];
    console.log(`[Reservation] Saved: ${customer_name}, ${reservation_date} ${reservation_time}, ${guests_count} guests`);

    // Send emails independently — one failing never blocks the other or the response
    sendAdminEmail({ customer_name, customer_phone, customer_email, reservation_date, reservation_time, guests_count, special_requests })
      .then(() => console.log(`[Email] Admin notification sent for: ${customer_name}`))
      .catch((err) => console.error(`[Email] Admin notification FAILED for ${customer_name}:`, err.message));

    if (customer_email) {
      sendCustomerEmail({ customer_name, customer_phone, customer_email, reservation_date, reservation_time, guests_count, special_requests })
        .then(() => console.log(`[Email] Customer confirmation sent to: ${customer_email}`))
        .catch((err) => console.error(`[Email] Customer confirmation FAILED for ${customer_email}:`, err.message));
    }

    res.status(201).json({ message: 'Reservation submitted successfully!', reservation });
  } catch (err) {
    console.error('createReservation error:', err.message, '\n', err.stack);
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message });
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
    console.error('getAllReservations error:', err.message, '\n', err.stack);
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
    console.error('updateReservationStatus error:', err.message, '\n', err.stack);
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
    console.error('deleteReservation error:', err.message, '\n', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createReservation, getAllReservations, updateReservationStatus, deleteReservation };
