const pool = require('../db/pool');
const mailer = require('../../config/mailer');

const FROM_EMAIL = 'Flash Lounge N Suite <noreply@flashlounge.org>';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'flashloungeandsuite@gmail.com';
if (!process.env.ADMIN_EMAIL) {
  console.warn('[Email] ADMIN_EMAIL env var is not set — falling back to flashloungeandsuite@gmail.com');
}

// ─── Shared HTML shell ────────────────────────────────────────────────────────
function emailShell(body) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:580px;margin:0 auto;background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">

    <!-- Header -->
    <div style="background:#111111;border-top:4px solid #FFD700;padding:24px 32px;">
      <h1 style="margin:0;color:#FFD700;font-size:20px;letter-spacing:3px;font-weight:bold;">FLASH LOUNGE N SUITE</h1>
      <p style="margin:4px 0 0;color:#666;font-size:11px;letter-spacing:4px;">"FLASH WAYS"</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;color:#cccccc;font-size:15px;line-height:1.7;">
      ${body}
    </div>

    <!-- Footer -->
    <div style="background:#111111;border-top:1px solid #2a2a2a;padding:16px 32px;text-align:center;">
      <p style="margin:0;color:#444;font-size:12px;">Flash Lounge N Suite &nbsp;·&nbsp; 07059693068 &nbsp;·&nbsp; Port Harcourt</p>
    </div>

  </div>
</body>
</html>`;
}

// ─── Reservation details block ────────────────────────────────────────────────
function detailsBlock({ reservation_date, reservation_time, guests_count, special_requests }) {
  return `
  <div style="background:#252525;border-left:4px solid #FFD700;border-radius:8px;padding:20px;margin:24px 0;">
    <p style="margin:0 0 12px;color:#FFD700;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Reservation Details</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="color:#888;padding:5px 0;font-size:14px;width:45%;">Date</td>
        <td style="color:#ffffff;font-size:14px;font-weight:bold;">${reservation_date}</td>
      </tr>
      <tr>
        <td style="color:#888;padding:5px 0;font-size:14px;">Time</td>
        <td style="color:#ffffff;font-size:14px;font-weight:bold;">${reservation_time}</td>
      </tr>
      <tr>
        <td style="color:#888;padding:5px 0;font-size:14px;">Guests</td>
        <td style="color:#ffffff;font-size:14px;font-weight:bold;">${guests_count}</td>
      </tr>
      ${special_requests ? `
      <tr>
        <td style="color:#888;padding:5px 0;font-size:14px;vertical-align:top;">Special Requests</td>
        <td style="color:#ffffff;font-size:14px;">${special_requests}</td>
      </tr>` : ''}
    </table>
  </div>`;
}

function goldButton(href, label) {
  return `<a href="${href}" style="display:inline-block;background:#FFD700;color:#000000;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:1px;margin-top:8px;">${label}</a>`;
}

// ─── Trigger 1: Admin notification on new reservation ────────────────────────
async function sendAdminNotification(reservation) {
  const { customer_name, customer_phone, customer_email, reservation_date, reservation_time, guests_count, special_requests } = reservation;

  const body = `
    <h2 style="margin:0 0 4px;color:#ffffff;font-size:20px;">New Reservation</h2>
    <p style="margin:0 0 20px;color:#888;font-size:14px;">A new booking has just been submitted.</p>

    <div style="background:#252525;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;color:#FFD700;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Customer Details</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#888;padding:5px 0;font-size:14px;width:45%;">Name</td>
          <td style="color:#ffffff;font-size:14px;font-weight:bold;">${customer_name}</td>
        </tr>
        <tr>
          <td style="color:#888;padding:5px 0;font-size:14px;">Phone</td>
          <td style="color:#ffffff;font-size:14px;">${customer_phone}</td>
        </tr>
        <tr>
          <td style="color:#888;padding:5px 0;font-size:14px;">Email</td>
          <td style="color:#ffffff;font-size:14px;">${customer_email || '<em style="color:#555">Not provided</em>'}</td>
        </tr>
      </table>
    </div>

    ${detailsBlock({ reservation_date, reservation_time, guests_count, special_requests })}

    <p style="color:#888;font-size:13px;margin-top:24px;">Log in to the admin panel to confirm or manage this reservation.</p>
  `;

  await mailer.sendMail({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `📋 New Reservation — ${customer_name} · ${reservation_date}`,
    html: emailShell(body),
  });
}

// ─── Trigger 1b: Customer confirmation on submission ─────────────────────────
async function sendCustomerSubmissionEmail(reservation) {
  const { customer_name, customer_phone, customer_email, reservation_date, reservation_time, guests_count, special_requests } = reservation;

  const body = `
    <h2 style="margin:0 0 4px;color:#ffffff;font-size:20px;">Hi ${customer_name},</h2>
    <p style="margin:0 0 20px;color:#cccccc;">We've received your reservation request. Our team will call you at <strong style="color:#FFD700;">${customer_phone}</strong> to confirm your booking shortly.</p>

    ${detailsBlock({ reservation_date, reservation_time, guests_count, special_requests })}

    <p style="color:#cccccc;">For any questions, call us at <strong style="color:#FFD700;">07059693068</strong>. We can't wait to host you!</p>
    <p style="margin-top:24px;color:#555;font-size:13px;font-style:italic;">Flash Lounge N Suite — Flash Ways</p>
  `;

  await mailer.sendMail({
    from: FROM_EMAIL,
    to: customer_email,
    subject: `Reservation Received — Flash Lounge N Suite`,
    html: emailShell(body),
  });
}

// ─── Trigger 2: Customer email on status update ───────────────────────────────
const STATUS_CONFIG = {
  confirmed: {
    subject: `Your Reservation is Confirmed ✓ — Flash Lounge N Suite`,
    headline: `You're Confirmed!`,
    headlineColor: `#FFD700`,
    intro: (name) => `Great news, <strong style="color:#ffffff;">${name}</strong>! Your reservation has been confirmed and we are looking forward to welcoming you. Get ready for a premium Flash experience.`,
    closing: `Come dressed to impress and get ready to enjoy the Flash Way. See you soon!`,
  },
  completed: {
    subject: `Thank You for Visiting — Flash Lounge N Suite`,
    headline: `Thank You for Visiting!`,
    headlineColor: `#FFD700`,
    intro: (name) => `It was an absolute pleasure hosting you, <strong style="color:#ffffff;">${name}</strong>. We hope your experience was everything you expected and more. Your presence made the night special.`,
    closing: `We'd love to see you again soon. The Flash Lounge doors are always open for you — anytime, day or night.`,
  },
  cancelled: {
    subject: `Reservation Cancellation — Flash Lounge N Suite`,
    headline: `Reservation Cancelled`,
    headlineColor: `#ff6b6b`,
    intro: (name) => `Hi <strong style="color:#ffffff;">${name}</strong>, we're sorry that your reservation had to be cancelled. We understand that plans change, and we truly hope this doesn't discourage you from visiting us.`,
    closing: `We'd love to host you another time. Please feel free to make a new reservation whenever you're ready — we'll be here for you.`,
  },
  pending: {
    subject: `Reservation Update — Flash Lounge N Suite`,
    headline: `Your Reservation is Under Review`,
    headlineColor: `#FFD700`,
    intro: (name) => `Hi <strong style="color:#ffffff;">${name}</strong>, your reservation request is currently under review by our team. We will reach out to you shortly to confirm the details.`,
    closing: `Thank you for your patience. If you have any urgent queries, please call us directly at 07059693068.`,
  },
};

async function sendStatusUpdateEmail(reservation) {
  const { customer_name, customer_email, customer_phone, reservation_date, reservation_time, guests_count, special_requests, status } = reservation;

  if (!customer_email) return;

  const config = STATUS_CONFIG[status];
  if (!config) return;

  const body = `
    <h2 style="margin:0 0 4px;color:${config.headlineColor};font-size:20px;">${config.headline}</h2>
    <p style="margin:0 0 24px;color:#cccccc;">${config.intro(customer_name)}</p>

    ${detailsBlock({ reservation_date, reservation_time, guests_count, special_requests })}

    <p style="color:#cccccc;margin-top:8px;">${config.closing}</p>

    ${status === 'cancelled'
      ? `<p style="margin-top:24px;">${goldButton('https://flashlounge.org/reserve', 'Book Again')}</p>`
      : status === 'completed'
      ? `<p style="margin-top:24px;">${goldButton('https://flashlounge.org/reserve', 'Book Your Next Visit')}</p>`
      : ''}

    <p style="margin-top:32px;color:#555;font-size:13px;">Questions? Call us at <strong>07059693068</strong> or reply to this email.</p>
    <p style="color:#555;font-size:13px;font-style:italic;">Flash Lounge N Suite — Flash Ways</p>
  `;

  await mailer.sendMail({
    from: FROM_EMAIL,
    to: customer_email,
    subject: config.subject,
    html: emailShell(body),
  });
}

// ─── Route handlers ───────────────────────────────────────────────────────────

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

    // Trigger 1 — Admin notification (always)
    sendAdminNotification({ customer_name, customer_phone, customer_email, reservation_date, reservation_time, guests_count, special_requests })
      .then(() => console.log(`[Email] Admin notified — ${customer_name}`))
      .catch((err) => console.error(`[Email] Admin notify FAILED:`, err.message));

    // Trigger 1b — Customer submission confirmation (only if email provided)
    if (customer_email) {
      sendCustomerSubmissionEmail({ customer_name, customer_phone, customer_email, reservation_date, reservation_time, guests_count, special_requests })
        .then(() => console.log(`[Email] Customer confirmation sent → ${customer_email}`))
        .catch((err) => console.error(`[Email] Customer confirm FAILED:`, err.message));
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

    const reservation = result.rows[0];

    // Trigger 2 — Status update email to customer
    sendStatusUpdateEmail(reservation)
      .then(() => console.log(`[Email] Status update (${status}) sent → ${reservation.customer_email || 'no email'}`))
      .catch((err) => console.error(`[Email] Status update FAILED (${status}):`, err.message));

    res.json(reservation);
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
