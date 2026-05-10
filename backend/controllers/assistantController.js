const Groq = require('groq-sdk');
const User = require('../models/User');
const Installment = require('../models/Installment');

exports.chatWithAssistant = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  try {
    // Fetch user context for more "Elite" advice
    const [user, installments] = await Promise.all([
      User.findById(userId),
      Installment.find({ user_id: userId, status: 'active' })
    ]);

    const activeDebt = installments.reduce((sum, ins) => sum + ins.remaining_balance, 0);
    const contextStr = `
      User Context:
      - Name: ${user.name}
      - Tier: ${user.tier}
      - Credit Limit: ₦${user.credit_limit}
      - Active Debt: ₦${activeDebt}
      - Risk Score: ${user.risk_score}/100
    `;

    if (process.env.GROQ_API_KEY) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are GadgetFlex AI, a high-end financial advisor for a premium gadget financing platform.
            Your goal is to provide elite, data-driven advice.
            
            ${contextStr}
            
            Guidelines:
            - If the user's Active Debt is high relative to their Credit Limit, advise caution.
            - If they are in a high tier (Silver/Gold), treat them as a VIP.
            - Explain the benefits of GadgetFlex (interest-free periods, insurance, credit building).
            - Keep responses professional, concise, and futuristic.`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 512,
        temperature: 0.6,
      });
      return res.json({ response: completion.choices[0].message.content });
    }

    // Fallback logic remains as a safety net
    const msg = message.toLowerCase();
    let response;

    if (msg.includes('daily') || msg.includes('plan')) {
      response = "Daily plans spread payments over 90 days — perfect if you receive daily income. Monthly plans work best for salaried workers. With your debt at ₦" + activeDebt + ", I recommend keeping a clear budget!";
    } else if (msg.includes('credit') || msg.includes('limit')) {
      response = "Your credit limit is ₦" + user.credit_limit + ". Complete your KYC to unlock even higher limits and premium interest rates!";
    } else if (msg.includes('interest')) {
      response = "GadgetFlex charges a flat 5% service fee. For a ₦100,000 gadget, that's just ₦5,000 in fees spread over your entire plan.";
    } else {
      response = "I'm GadgetFlex AI. I see you have ₦" + activeDebt + " in active installments. To give you deep, data-driven advice, I need my high-performance engine active. For now, check your Dashboard for current limits!";
    }
    
    res.json({ response });
  } catch (error) {
    console.error('AI Assistant error:', error.message);
    res.status(500).json({ error: 'Assistant temporarily unavailable.' });
  }
};
