const { query } = require('../config/db');

/**
 * Pillar 4: Logistics & Fulfillment
 * Simulates real-time order tracking progress
 */

const LOGISTICS_STEPS = [
  'Order Placed',
  'Processing',
  'Packed & Ready',
  'With Courier',
  'In Transit',
  'Out for Delivery',
  'Delivered'
];

exports.updateTrackingStatus = async () => {
  console.log('--- UPDATING LOGISTICS TRACKING ---');
  
  try {
    // 1. Find active orders (not delivered yet)
    const { rows: activeOrders } = await query(`
      SELECT o.id, o.status, o.created_at 
      FROM orders o 
      WHERE o.status != 'delivered' AND o.status != 'cancelled'
    `);

    for (const order of activeOrders) {
      const currentIndex = LOGISTICS_STEPS.indexOf(order.status) === -1 ? 0 : LOGISTICS_STEPS.indexOf(order.status);
      
      // Move to next step with some probability or time logic
      if (currentIndex < LOGISTICS_STEPS.length - 1) {
        const nextStatus = LOGISTICS_STEPS[currentIndex + 1];
        console.log(`Moving Order ${order.id} from ${order.status} to ${nextStatus}`);
        
        await query("UPDATE orders SET status = $1 WHERE id = $2", [nextStatus, order.id]);
        
        // Also update corresponding installment status if it's the first delivery
        if (nextStatus === 'Delivered') {
           await query("UPDATE installments SET status = 'active' WHERE order_id = $1 AND status = 'pending'", [order.id]);
        }
      }
    }

  } catch (err) {
    console.error('Logistics update failed:', err);
  }
};
