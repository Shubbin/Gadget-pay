const supabase = require('../config/supabase');

/**
 * Pillar 4: Logistics & Fulfillment
 * Simulates real-time order tracking progress
 */

const LOGISTICS_STEPS = [
  'pending',
  'processing',
  'shipped',
  'delivered'
];

exports.updateTrackingStatus = async () => {
  console.log('--- UPDATING LOGISTICS TRACKING ---');
  
  try {
    // 1. Find active orders (not delivered yet)
    const { data: activeOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, status')
      .not('status', 'in', '("delivered","cancelled")');

    if (fetchError) throw fetchError;

    for (const order of (activeOrders || [])) {
      const currentIndex = LOGISTICS_STEPS.indexOf(order.status) === -1 ? 0 : LOGISTICS_STEPS.indexOf(order.status);
      
      // Move to next step
      if (currentIndex < LOGISTICS_STEPS.length - 1) {
        const nextStatus = LOGISTICS_STEPS[currentIndex + 1];
        console.log(`Moving Order ${order.id} from ${order.status} to ${nextStatus}`);
        
        await supabase
          .from('orders')
          .update({ status: nextStatus })
          .eq('id', order.id);
        
        // Also update corresponding installment status if delivered
        if (nextStatus === 'delivered') {
           await supabase
             .from('installments')
             .update({ status: 'active' })
             .eq('order_id', order.id)
             .eq('status', 'pending');
        }
      }
    }

  } catch (err) {
    console.error('Logistics update failed:', err.message);
  }
};
