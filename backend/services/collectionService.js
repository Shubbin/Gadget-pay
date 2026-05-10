const { query } = require('../config/db');
const { chargeAuthorization } = require('./paystackService');
const { sendEmail } = require('./emailService');

/**
 * Pillar 1: Risk & Collection Engine
 * Handles automated debt recovery and late fee application
 */

const LATE_FEE_PERCENTAGE = 0.05; // 5% late fee
const GRACE_PERIOD_DAYS = 3;

exports.processCollection = async () => {
  console.log('--- STARTING COLLECTION PROCESS ---');
  
  try {
    // 1. Find overdue installments
    const { rows: overdue } = await query(`
      SELECT i.*, u.email, u.name as user_name, u.id as user_id
      FROM installments i
      JOIN orders o ON i.order_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE i.next_payment_date < CURRENT_DATE
      AND i.status != 'completed'
    `);

    console.log(`Found ${overdue.length} overdue installments.`);

    for (const inst of overdue) {
      const daysOverdue = Math.floor((new Date() - new Date(inst.next_payment_date)) / (1000 * 60 * 60 * 24));
      
      // 2. Apply Late Fees if beyond grace period
      if (daysOverdue >= GRACE_PERIOD_DAYS && inst.late_fees_accrued == 0) {
        const lateFee = parseFloat(inst.remaining_balance) * LATE_FEE_PERCENTAGE;
        console.log(`Applying late fee of ₦${lateFee} to installment ${inst.id} (User: ${inst.user_name})`);
        
        await query(
          "UPDATE installments SET late_fees_accrued = late_fees_accrued + $1, remaining_balance = remaining_balance + $1 WHERE id = $2",
          [lateFee, inst.id]
        );

        // Notify User
        await sendEmail({
          to: inst.email,
          subject: 'Late Fee Applied - GadgetFlex',
          text: `Hi ${inst.user_name}, a late fee of ₦${lateFee} has been applied to your overdue installment. Please settle your balance to avoid further penalties.`
        });
      }

      // 3. Auto-Retry Payment if cards are on file
      const { rows: cards } = await query(
        "SELECT authorization_code FROM auto_debit_subscriptions WHERE user_id = $1 AND status = 'active' LIMIT 1",
        [inst.user_id]
      );

      if (cards.length > 0) {
        console.log(`Attempting auto-retry for overdue installment ${inst.id}...`);
        const authCode = cards[0].authorization_code;
        
        // Only retry every 3 days to avoid spamming the user's bank
        const lastRetry = inst.last_collection_retry ? new Date(inst.last_collection_retry) : null;
        const daysSinceLastRetry = lastRetry ? Math.floor((new Date() - lastRetry) / (1000 * 60 * 60 * 24)) : 99;

        if (daysSinceLastRetry >= 3) {
          try {
            const success = await chargeAuthorization(inst.email, inst.remaining_balance, authCode);
            if (success) {
              console.log(`✅ Auto-retry successful for ${inst.id}`);
              await query(
                "UPDATE installments SET remaining_balance = 0, status = 'completed' WHERE id = $1",
                [inst.id]
              );
            } else {
              console.warn(`❌ Auto-retry failed for ${inst.id}`);
              await query("UPDATE installments SET last_collection_retry = CURRENT_DATE WHERE id = $1", [inst.id]);
            }
          } catch (err) {
            console.error(`Retry error for ${inst.id}:`, err.message);
          }
        }
      }
    }

  } catch (err) {
    console.error('Collection process failed:', err);
  }
};
