const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Installment = require('../models/Installment');
const InsurancePlan = require('../models/InsurancePlan');
const AutoDebitSubscription = require('../models/AutoDebitSubscription');

const calculateInstallments = (price, duration, frequency, interestDiscount = 0, insurancePremium = 0) => {
  const baseRate = 0.05; // 5% flat
  const effectiveRate = Math.max(0, baseRate - (interestDiscount / 100));
  
  const priceWithInterest = price * (1 + effectiveRate * (duration / 12));
  const totalWithInsurance = priceWithInterest + (insurancePremium * duration);
  
  let divisor;
  switch (frequency) {
    case 'daily': divisor = duration * 30; break;
    case 'weekly': divisor = duration * 4; break;
    case 'monthly': divisor = duration; break;
    default: divisor = duration;
  }

  const installmentAmount = Math.ceil(totalWithInsurance / divisor);
  const totalPayable = installmentAmount * divisor;

  return { installmentAmount, totalPayable, periods: divisor };
};

exports.createPlan = async (req, res) => {
  const { productId, duration, frequency, insuranceId } = req.body;
  const userId = req.user.id;

  try {
    // 1. Get product, user, and insurance info
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    const user = await User.findById(userId).populate('tier_id');
    
    let insurancePremium = 0;
    if (insuranceId) {
      // Note: In original code insuranceId was used in SQL query. 
      // If it's a MongoDB ID, we use findById. If it's a number/string identifier, we findOne.
      // For now assuming it might be a name or numeric ID from previous logic.
      const insurance = await InsurancePlan.findOne({ $or: [{ _id: mongoose.isValidObjectId(insuranceId) ? insuranceId : null }, { name: insuranceId }] });
      insurancePremium = insurance ? insurance.monthly_premium : 0;
    }

    // 2. Calculate plan
    const { installmentAmount, totalPayable, periods } = calculateInstallments(
      product.price, 
      duration, 
      frequency, 
      user?.tier_id?.interest_discount || user?.interest_discount || 0,
      insurancePremium
    );

    // 3. Create Order
    const order = new Order({
      user_id: userId,
      product_id: productId,
      status: 'pending',
      total_amount: totalPayable,
      insurance_id: insuranceId // keeping as is for compatibility
    });
    await order.save();

    // 4. Create Installment Plan
    const plan = new Installment({
      order_id: order._id,
      total_installments: periods,
      frequency,
      total_amount: totalPayable,
      remaining_balance: totalPayable,
      next_payment_date: new Date(Date.now() + 86400000)
    });
    await plan.save();

    res.status(201).json({ order, plan, installmentAmount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getSchedule = async (req, res) => {
  const { planId } = req.params;
  try {
    const plan = await Installment.findById(planId).populate('order_id');
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    
    // Format to match expected frontend structure if needed
    const result = plan.toObject();
    if (result.order_id) {
        result.orders = result.order_id;
        delete result.order_id;
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserInstallments = async (req, res) => {
  try {
    const installments = await Installment.find()
      .populate({
        path: 'order_id',
        match: { user_id: req.user.id },
        populate: { path: 'product_id' }
      })
      .sort({ created_at: -1 });

    // Filter out installments where order_id didn't match (user_id mismatch)
    const filtered = installments.filter(i => i.order_id != null);

    const result = await Promise.all(filtered.map(async (i) => {
      const ads = await AutoDebitSubscription.findOne({ installment_id: i._id, status: 'active' });
      return {
        ...i.toObject(),
        product_name: i.order_id.product_id?.name,
        image_url: i.order_id.product_id?.image_url,
        order_total: i.order_id.total_amount,
        order_date: i.order_id.created_at,
        auto_debit_active: !!ads
      };
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
