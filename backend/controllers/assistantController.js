const Groq = require('groq-sdk');

exports.chatWithAssistant = async (req, res) => {
  const { message } = req.body;

  try {
    if (process.env.GROQ_API_KEY) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are GadgetFlex AI, a friendly and knowledgeable financial advisor for a tech procurement platform.
You help users:
- Choose the right installment plan (Daily, Weekly, or Monthly) based on their income
- Understand how interest and repayment schedules work
- Pick the right gadget for their budget
- Understand credit limits and risk scores
Keep your answers concise, practical, and encouraging. Always refer to the platform as GadgetFlex.`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 512,
        temperature: 0.7,
      });
      return res.json({ response: completion.choices[0].message.content });
    }

    // Smart mock fallback (no API key needed)
    const msg = message.toLowerCase();
    let response;

    if (msg.includes('daily') || msg.includes('plan')) {
      response = "Daily plans spread payments over 90 days — perfect if you receive daily income or a stipend. Monthly plans work best for salaried workers. What's your income frequency?";
    } else if (msg.includes('credit') || msg.includes('limit') || msg.includes('eligible')) {
      response = "Your credit limit starts at ₦500,000 and grows automatically as you make on-time payments. Complete your KYC verification first to get the best rates!";
    } else if (msg.includes('interest') || msg.includes('rate')) {
      response = "GadgetFlex charges a flat 5% service fee — no hidden charges. A ₦100,000 gadget on a 12-month plan means ₦105,000 total, paid as ₦8,750/month.";
    } else if (msg.includes('kyc') || msg.includes('verify') || msg.includes('verified')) {
      response = "KYC verification is quick! Head to your Dashboard → Profile → Submit KYC. Once an admin approves it, you unlock higher credit limits and more installment options.";
    } else if (msg.includes('recommend') || msg.includes('best') || msg.includes('gadget')) {
      response = "Check our Marketplace for top-ranked gadgets! Our recommendation engine suggests 'Often Bought Together' products based on real customer data. Want to start with Laptops or Phones?";
    } else {
      response = "Hi! I'm GadgetFlex AI 🤖. I can help you:\n• Choose the right installment plan\n• Calculate your monthly payments\n• Understand your credit eligibility\n\nWhat would you like to know?";
    }

    res.json({ response });
  } catch (error) {
    console.error('AI Assistant error:', error.message);
    res.status(500).json({ error: 'Assistant temporarily unavailable. Please try again.' });
  }
};
