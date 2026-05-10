const { query } = require('../config/db');

/**
 * Pillar 2: Vendor Empowerment & Escrow
 * Handles automated settlement of funds from Escrow to Vendor Balance
 */

exports.processEscrowSettlements = async () => {
  console.log('--- STARTING ESCROW SETTLEMENT PROCESS ---');
  
  try {
    // 1. Find transactions ready for settlement
    const { rows: ready } = await query(`
      SELECT t.*, p.vendor_id
      FROM transactions t
      JOIN installments i ON t.installment_id = i.id
      JOIN orders o ON i.order_id = o.id
      JOIN products p ON o.product_id = p.id
      WHERE t.is_settled_to_vendor = FALSE
      AND t.settlement_ready_at <= CURRENT_TIMESTAMP
      AND t.status = 'success'
    `);

    console.log(`Found ${ready.length} transactions ready for settlement.`);

    for (const trx of ready) {
      console.log(`Settling ₦${trx.amount} to vendor ${trx.vendor_id} for transaction ${trx.id}`);
      
      // Use a transaction for safety
      await query('BEGIN');
      try {
        // Update vendor's escrow balance (adding to their withdrawable balance/escrow)
        // For this architecture, we'll store it in users.escrow_balance as "Available to Withdraw"
        await query(
          "UPDATE users SET escrow_balance = escrow_balance + $1 WHERE id = $2",
          [trx.amount, trx.vendor_id]
        );

        // Mark transaction as settled
        await query(
          "UPDATE transactions SET is_settled_to_vendor = TRUE WHERE id = $1",
          [trx.id]
        );

        await query('COMMIT');
        console.log(`✅ Settlement successful for transaction ${trx.id}`);
      } catch (err) {
        await query('ROLLBACK');
        console.error(`❌ Failed to settle transaction ${trx.id}:`, err.message);
      }
    }

  } catch (err) {
    console.error('Escrow settlement process failed:', err);
  }
};
