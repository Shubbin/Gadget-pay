const Groq = require('groq-sdk');
const supabase = require('../config/supabase');

exports.chatWithAssistant = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  try {
    // 1. Fetch user context from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) throw new Error('User not found');

    const { data: installments, error: instError } = await supabase
      .from('installments')
      .select('remaining_balance')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (instError) throw instError;

    const activeDebt = (installments || []).reduce((sum, ins) => sum + (Number(ins.remaining_balance) || 0), 0);
    
    const contextStr = `
      User Context:
      - Name: ${user.name}
      - Tier: ${user.tier}
      - Credit Limit: ₦${user.credit_limit}
      - Active Debt: ₦${activeDebt}
      - Risk Score: ${user.risk_score}/100
    `;

    let aiResponse = "";

    try {
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
        aiResponse = completion.choices[0].message.content;
      } else {
        throw new Error('GROQ_API_KEY missing');
      }
    } catch (err) {
      console.warn('AI engine unavailable, falling back to mock system:', err.message);
      
      const msg = message.toLowerCase();
      if (msg.includes('daily') || msg.includes('plan')) {
        aiResponse = `Greetings ${user.name}! Based on your ${user.tier} status, our Daily Plan (90 days) is the most efficient choice for consistency. With your current debt at ₦${activeDebt.toLocaleString()}, sticking to a daily bit-by-bit rhythm will help protect your credit score.`;
      } else if (msg.includes('credit') || msg.includes('limit') || msg.includes('score')) {
        aiResponse = `Your current Credit Limit is ₦${user.credit_limit.toLocaleString()}. Since your Risk Score is ${user.risk_score}/100, you are eligible for higher limits soon. Just keep paying your installments on time to boost your internal GadgetFlex rating!`;
      } else if (msg.includes('interest') || msg.includes('fee')) {
        aiResponse = "We believe in transparency, bro. Our flat 5% service fee covers everything. For example, a ₦100k gadget only costs ₦5k in total fees, which we spread across your entire payment period. Zero hidden charges, always.";
      } else {
        aiResponse = `Welcome to the Elite club, ${user.name}. I'm currently optimizing my deep-learning core, but I can see you have ₦${activeDebt.toLocaleString()} in active installments. You're doing great! Check your Dashboard for the latest insurance and upgrade offers.`;
      }
    }
    
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('AI Assistant fatal error:', error.message);
    res.status(500).json({ error: 'Assistant temporarily unavailable.' });
  }
};
