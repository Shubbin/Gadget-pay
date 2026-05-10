/**
 * SettlementService
 * 
 * Handles the logic for vendor payouts and platform commissions.
 */

const Order = require('../models/Order');
const User = require('../models/User');

class SettlementService {
  /**
   * Calculate payout for an order and update balances
   * @param {string} orderId 
   */
  async processOrderCommission(orderId) {
    const order = await Order.findById(orderId).populate('vendor_id');
    if (!order || !order.vendor_id) return;

    const price = order.total_amount;
    const commissionRate = order.vendor_id.vendor_commission_rate / 100;
    const commission = price * commissionRate;
    const payout = price - commission;

    order.platform_commission = commission;
    order.vendor_payout_amount = payout;
    order.payout_status = 'pending';
    await order.save();

    // Update vendor's pending balance
    await User.findByIdAndUpdate(order.vendor_id, {
      $inc: { pending_payout_balance: payout }
    });

    return { commission, payout };
  }

  /**
   * Settle funds (move from pending to settled)
   * This is called after delivery is confirmed or a safety period
   * @param {string} orderId 
   */
  async settleFunds(orderId) {
    const order = await Order.findById(orderId);
    if (!order || order.payout_status !== 'pending') return;

    const payoutAmount = order.vendor_payout_amount;

    // Move balance for vendor
    await User.findByIdAndUpdate(order.vendor_id, {
      $inc: { 
        pending_payout_balance: -payoutAmount,
        settled_payout_balance: payoutAmount
      }
    });

    order.payout_status = 'settled';
    await order.save();

    return true;
  }
}

module.exports = new SettlementService();
