const cron = require('node-cron');
const { query } = require('../config/db');
const { sendEmail, sendSMS } = require('./commHub');

const runReminderCheck = async () => {
  console.log('Running scheduled installment reminder check...');
  
  try {
    // 1. Find installments due in the next 48 hours with remaining balance
    const fortyEightHoursFromNow = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    
    const { rows: dueInstallments } = await query(
      `SELECT i.*, u.id as user_id, u.email, u.phone, u.name as user_name
       FROM installments i
       JOIN orders o ON i.order_id = o.id
       JOIN users u ON o.user_id = u.id
       WHERE i.next_payment_date <= $1 AND i.remaining_balance > 0`,
      [fortyEightHoursFromNow]
    );

    if (!dueInstallments || dueInstallments.length === 0) {
      console.log('No installments due for reminders.');
      return;
    }

    // 2. Process notifications
    for (const ins of dueInstallments) {
      const message = `Friendly reminder: Your GadgetFlex payment of ${ins.remaining_balance} is due on ${ins.next_payment_date}.`;
      
      // In-app
      await query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [ins.user_id, 'Payment Due', message, 'reminder']
      );

      // Real-world (if contact info exists)
      if (ins.email) await sendEmail(ins.email, 'GadgetFlex Payment Reminder', message);
      if (ins.phone) await sendSMS(ins.phone, message);
    }

    console.log(`Successfully processed ${dueInstallments.length} reminders.`);
  } catch (error) {
    console.error('Error running reminder check:', error);
  }
};

// Run every day at 8:00 AM
const initReminders = () => {
  cron.schedule('0 8 * * *', runReminderCheck);
  console.log('Automated reminder cron job initialized.');
  
  // Also run once on server start for immediate testing if needed
  // runReminderCheck(); 
};

module.exports = { initReminders, runReminderCheck };
