const pool = require('../db/pool');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Public
const getActiveModels = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, photo_url, vote_price, vote_count FROM models WHERE is_active = true ORDER BY vote_count DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Initiate vote payment via Korapay
const initiateVote = async (req, res) => {
  const { model_id } = req.params;
  const { voter_name, voter_phone, voter_email } = req.body;

  if (!voter_name || !voter_phone) {
    return res.status(400).json({ error: 'Name and phone are required to vote' });
  }

  try {
    const modelResult = await pool.query('SELECT * FROM models WHERE id=$1 AND is_active=true', [model_id]);
    if (modelResult.rows.length === 0) return res.status(404).json({ error: 'Model not found or voting closed' });

    const model = modelResult.rows[0];
    const reference = `vote-${model_id.slice(0, 8)}-${uuidv4().slice(0, 8)}`;
    const amount = model.vote_price;

    // Create pending vote record
    await pool.query(
      `INSERT INTO model_votes (model_id, voter_name, voter_phone, voter_email, amount_paid, payment_reference, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
      [model_id, voter_name, voter_phone, voter_email || null, amount, reference]
    );

    // Initialize Korapay charge
    const korapayRes = await axios.post(
      'https://api.korapay.com/merchant/api/v1/charges/initialize',
      {
        amount: parseFloat(amount),
        currency: 'NGN',
        reference,
        customer: {
          name: voter_name,
          email: voter_email || `${voter_phone}@flashlounge.com`,
        },
        notification_url: `${process.env.BACKEND_URL || 'https://flashlounge-backend.up.railway.app'}/api/payments/webhook`,
        redirect_url: `${process.env.FRONTEND_URL || 'https://flashlounge.up.railway.app'}/voting?ref=${reference}`,
        merchant_bears_cost: false,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.KORAPAY_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      checkout_url: korapayRes.data.data.checkout_url,
      reference,
      model: { id: model.id, name: model.name, vote_price: model.vote_price },
    });
  } catch (err) {
    console.error('Vote initiation error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

// Korapay webhook handler
const handlePaymentWebhook = async (req, res) => {
  const crypto = require('crypto');
  const signature = req.headers['x-korapay-signature'];
  const hash = crypto
    .createHmac('sha256', process.env.KORAPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== hash) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const { event, data } = req.body;
  if (event === 'charge.success') {
    const { reference } = data;
    try {
      const voteResult = await pool.query(
        'SELECT * FROM model_votes WHERE payment_reference=$1 AND payment_status=$2',
        [reference, 'pending']
      );
      if (voteResult.rows.length > 0) {
        const vote = voteResult.rows[0];
        await pool.query(
          'UPDATE model_votes SET payment_status=$1 WHERE payment_reference=$2',
          ['success', reference]
        );
        await pool.query(
          `UPDATE models SET vote_count = vote_count + 1, total_revenue = total_revenue + $1, updated_at=NOW()
           WHERE id = $2`,
          [vote.amount_paid, vote.model_id]
        );
      }
    } catch (err) {
      console.error('Webhook processing error:', err);
    }
  }
  res.json({ received: true });
};

// Verify payment manually (called after redirect)
const verifyPayment = async (req, res) => {
  const { reference } = req.params;
  try {
    const korapayRes = await axios.get(
      `https://api.korapay.com/merchant/api/v1/charges/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.KORAPAY_SECRET_KEY}` } }
    );

    const status = korapayRes.data.data.status;
    if (status === 'success') {
      const voteResult = await pool.query(
        'SELECT * FROM model_votes WHERE payment_reference=$1',
        [reference]
      );
      if (voteResult.rows.length > 0 && voteResult.rows[0].payment_status === 'pending') {
        const vote = voteResult.rows[0];
        await pool.query('UPDATE model_votes SET payment_status=$1 WHERE payment_reference=$2', ['success', reference]);
        await pool.query(
          'UPDATE models SET vote_count = vote_count + 1, total_revenue = total_revenue + $1, updated_at=NOW() WHERE id=$2',
          [vote.amount_paid, vote.model_id]
        );
      }
      const modelResult = await pool.query('SELECT id, name, vote_count FROM models WHERE id=(SELECT model_id FROM model_votes WHERE payment_reference=$1)', [reference]);
      return res.json({ status: 'success', model: modelResult.rows[0] || null });
    }
    res.json({ status });
  } catch (err) {
    console.error('Verify error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// Admin
const getAllModels = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM models ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createModel = async (req, res) => {
  const { name, vote_price } = req.body;
  if (!name || !vote_price) return res.status(400).json({ error: 'Name and vote price required' });
  try {
    const photoUrl = req.file ? `/uploads/models/${req.file.filename}` : null;
    const result = await pool.query(
      'INSERT INTO models (name, photo_url, vote_price) VALUES ($1, $2, $3) RETURNING *',
      [name, photoUrl, parseFloat(vote_price)]
    );
    console.log(`Model created: ${name}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createModel error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateModel = async (req, res) => {
  const { id } = req.params;
  const { name, vote_price, is_active } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM models WHERE id=$1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Model not found' });
    const m = existing.rows[0];
    const photoUrl = req.file ? `/uploads/models/${req.file.filename}` : m.photo_url;
    const result = await pool.query(
      `UPDATE models SET name=$1, photo_url=$2, vote_price=$3, is_active=$4, updated_at=NOW() WHERE id=$5 RETURNING *`,
      [name || m.name, photoUrl, vote_price ? parseFloat(vote_price) : m.vote_price, is_active !== undefined ? is_active : m.is_active, id]
    );
    console.log(`Model updated: ${id}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateModel error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteModel = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM models WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Model not found' });
    console.log(`Model deleted: ${id}`);
    res.json({ message: 'Model deleted' });
  } catch (err) {
    console.error('deleteModel error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getModelVotes = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT mv.*, m.name as model_name FROM model_votes mv
       JOIN models m ON mv.model_id = m.id
       WHERE mv.model_id=$1 AND mv.payment_status='success'
       ORDER BY mv.created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const resetModelVotes = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE model_votes SET payment_status=$1 WHERE model_id=$2', ['archived', id]);
    await pool.query('UPDATE models SET vote_count=0, total_revenue=0, updated_at=NOW() WHERE id=$1', [id]);
    res.json({ message: 'Votes reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getActiveModels, initiateVote, handlePaymentWebhook, verifyPayment,
  getAllModels, createModel, updateModel, deleteModel, getModelVotes, resetModelVotes,
};
