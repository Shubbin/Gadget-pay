const cron = require('node-cron');
const User = require('../models/User');
const Installment = require('../models/Installment');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const AutoDebitSubscription = require('../models/AutoDebitSubscription');
const { sendEmail } = require('./commHub');
const { chargeAuthorization } = require('../services/paystackService');
const { processCollection } = require('../services/collectionService');
const { processEscrowSettlements } = require('../services/escrowService');
const { updateTrackingStatus } = require('../services/logisticsService');
const Order = require('../models/Order');
const settlementService = require('../services/SettlementService');

const runReminderCheck = async () => {
  console.log('Running scheduled installment reminder check...');
  try {
    const fortyEightHoursFromNow = new Date(Date.now() + 48 * 60 * 60 * 1000);
    
    const dueInstallments = await Installment.find({
      next_payment_date: { $lte: fortyEightHoursFromNow },
      remaining_balance: { $gt: 0 }
    }).populate({
      path: 'order_id',
      populate: { path: 'user_id' }
    });

    for (const ins of dueInstallments) {
      const user = ins.order_id?.user_id;
      if (!user) continue;

      const message = `Friendly reminder: Your GadgetFlex payment of ${ins.remaining_balance} is due on ${ins.next_payment_date}.`;
      
      const notification = new Notification({
        user_id: user._id,
        title: 'Payment Due',
        message,
        type: 'reminder'
      });
      await notification.save();

      if (user.email) await sendEmail(user.email, 'GadgetFlex Payment Reminder', message);
    }
  } catch (error) { console.error('Reminder Check failed:', error); }
};

const runAutoDebitCheck = async () => {
  console.log('Running scheduled auto-debit process...');
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const payableInstallments = await Installment.find({
      next_payment_date: { $lte: today },
      remaining_balance: { $gt: 0 },
      status: 'active'
    }).populate({
      path: 'order_id',
      populate: { path: 'user_id' }
    });

    for (const ins of payableInstallments) {
      try {
        const user = ins.order_id?.user_id;
        if (!user) continue;

        const ads = await AutoDebitSubscription.findOne({ user_id: user._id, status: 'active' });
        if (!ads) continue;

        const amountToCharge = ins.remaining_balance; 
        
        const result = await chargeAuthorization(
          user.email, 
          amountToCharge * 100,
          ads.authorization_code, 
          { installmentId: ins._id, userId: user._id }
        );

        if (result.data.status === 'success') {
          console.log(`[Auto-Debit] Success for installment ${ins._id}`);
          
          ins.remaining_balance -= amountToCharge;
          if (ins.remaining_balance <= 0) {
            ins.status = 'completed';
          }
          await ins.save();

          const transaction = new Transaction({
            installment_id: ins._id,
            amount: amountToCharge,
            status: 'success',
            payment_reference: result.data.reference
          });
          await transaction.save();
        }
      } catch (err) {
        console.error(`[Auto-Debit] Failed for ${ins._id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Auto-Debit Check failed:', error);
  }
};

const runVendorSettlementCheck = async () => {
  console.log('Running automated vendor settlement check...');
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    // Find orders that are pending payout and were created more than 48 hours ago
    const pendingOrders = await Order.find({
      payout_status: 'pending',
      created_at: { $lte: fortyEightHoursAgo }
    });

    console.log(`[Settlement] Found ${pendingOrders.length} orders eligible for settlement.`);

    for (const order of pendingOrders) {
      try {
        await settlementService.settleFunds(order._id);
        console.log(`[Settlement] Successfully settled Order ${order._id}`);
      } catch (err) {
        console.error(`[Settlement] Failed for Order ${order._id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Vendor Settlement Check failed:', error);
  }
};

const initReminders = () => {
  cron.schedule('0 8 * * *', runReminderCheck);
  cron.schedule('30 8 * * *', runAutoDebitCheck); 
  cron.schedule('0 9 * * *', processCollection); 
  cron.schedule('0 10 * * *', processEscrowSettlements); 
  cron.schedule('0 11 * * *', runVendorSettlementCheck); // Run every day at 11 AM
  cron.schedule('0 */3 * * *', updateTrackingStatus); 
  console.log('Automated reminder, auto-debit, collection, escrow, logistics, and vendor settlement cron jobs initialized.');
};

module.exports = { initReminders, runReminderCheck, runAutoDebitCheck };
