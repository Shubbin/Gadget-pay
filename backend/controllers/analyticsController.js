const { query } = require('../config/db');

exports.getDetailedAnalytics = async (req, res) => {
  try {
    // 1. Revenue & Outstanding Balance
    const { rows: installments } = await query(`
      SELECT i.remaining_balance, o.total_amount 
      FROM installments i
      JOIN orders o ON i.order_id = o.id
    `);

    const totalPortfolio = installments.reduce((sum, item) => sum + Number(item.total_amount), 0);
    const outstandingDebt = installments.reduce((sum, item) => sum + Number(item.remaining_balance), 0);
    const recoveredRevenue = totalPortfolio - outstandingDebt;

    // 2. Plan Popularity
    const { rows: plans } = await query(`
      SELECT frequency as name, COUNT(*) as value 
      FROM installments 
      GROUP BY frequency
    `);

    // 3. User Risk Distribution
    const { rows: riskDist } = await query('SELECT risk_score FROM users WHERE risk_score IS NOT NULL');

    res.json({
      financials: { totalPortfolio, outstandingDebt, recoveredRevenue },
      riskDistribution: riskDist,
      plans: plans || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGrowthData = async (req, res) => {
  try {
    const { rows: sales } = await query(`
      SELECT TO_CHAR(created_at, 'Mon') as month, SUM(total_amount) as sales 
      FROM orders 
      GROUP BY month 
      ORDER BY MIN(created_at)
    `);

    const { rows: installments } = await query(`
      SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as active 
      FROM installments 
      GROUP BY month 
      ORDER BY MIN(created_at)
    `);

    res.json({ sales, installments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
