const cron = require('node-cron');
const supabase = require('../config/supabase');
const { sendEmail } = require('./commHub');
const { chargeAuthorization } = require('../services/paystackService');
const settlementService = require('../services/SettlementService');

const runReminderCheck = async () => {
  console.log('Running scheduled installment reminder check...');
  try {
    const fortyEightHoursFromNow = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    
    const { data: dueInstallments, error } = await supabase
      .from('installments')
      .select(`
        *,
        users!inner(*),
        orders!inner(*)
      `)
      .lte('next_payment_date', fortyEightHoursFromNow)
      .gt('remaining_balance', 0);

    if (error) throw error;

    for (const ins of dueInstallments) {
      const user = ins.users;
      if (!user) continue;

      const message = `Friendly reminder: Your GadgetFlex payment of ${ins.remaining_balance} is due on ${new Date(ins.next_payment_date).toLocaleDateString()}.`;
      
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: user.id,
            title: 'Payment Due',
            message,
            type: 'reminder'
          }
        ]);

      if (user.email) await sendEmail(user.email, 'GadgetFlex Payment Reminder', message);
    }
  } catch (error) { console.error('Reminder Check failed:', error); }
};

const runAutoDebitCheck = async () => {
  console.log('Running scheduled auto-debit process...');
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const todayIso = today.toISOString();

    const { data: payableInstallments, error } = await supabase
      .from('installments')
      .select(`
        *,
        users!inner(*)
      `)
      .lte('next_payment_date', todayIso)
      .gt('remaining_balance', 0)
      .eq('status', 'active');

    if (error) throw error;

    for (const ins of payableInstallments) {
      try {
        const user = ins.users;
        if (!user) continue;

        // Note: Auto-debit check requires card authorization logic
        // This is a simplified version
        console.log(`[Auto-Debit] Attempting charge for installment ${ins.id}`);
        
      } catch (err) {
        console.error(`[Auto-Debit] Failed for ${ins.id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Auto-Debit Check failed:', error);
  }
};

const runVendorSettlementCheck = async () => {
  console.log('Running automated vendor settlement check...');
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    const { data: pendingOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('payout_status', 'pending')
      .lte('created_at', fortyEightHoursAgo);

    if (error) throw error;

    console.log(`[Settlement] Found ${pendingOrders.length} orders eligible for settlement.`);

    for (const order of pendingOrders) {
      try {
        await settlementService.settleFunds(order.id);
        console.log(`[Settlement] Successfully settled Order ${order.id}`);
      } catch (err) {
        console.error(`[Settlement] Failed for Order ${order.id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Vendor Settlement Check failed:', error);
  }
};

const initReminders = () => {
  cron.schedule('0 8 * * *', runReminderCheck);
  cron.schedule('30 8 * * *', runAutoDebitCheck); 
  cron.schedule('0 11 * * *', runVendorSettlementCheck);
  console.log('Automated reminder, auto-debit, and vendor settlement cron jobs initialized.');
};

module.exports = { initReminders, runReminderCheck, runAutoDebitCheck };
