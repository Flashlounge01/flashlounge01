const pool = require('../db/pool');

const getDashboardStats = async (req, res) => {
  try {
    const [reservations, votes, revenue, pendingRes, models] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM reservations'),
      pool.query("SELECT COALESCE(SUM(vote_count), 0) as total FROM models"),
      pool.query("SELECT COALESCE(SUM(total_revenue), 0) as total FROM models"),
      pool.query("SELECT COUNT(*) FROM reservations WHERE status='pending'"),
      pool.query('SELECT id, name, vote_count, total_revenue FROM models WHERE is_active=true ORDER BY vote_count DESC LIMIT 5'),
    ]);

    const todayRes = await pool.query(
      "SELECT COUNT(*) FROM reservations WHERE reservation_date = CURRENT_DATE"
    );

    res.json({
      total_reservations: parseInt(reservations.rows[0].count),
      total_votes: parseInt(votes.rows[0].total),
      total_revenue: parseFloat(revenue.rows[0].total),
      pending_reservations: parseInt(pendingRes.rows[0].count),
      today_reservations: parseInt(todayRes.rows[0].count),
      top_models: models.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getDashboardStats };
