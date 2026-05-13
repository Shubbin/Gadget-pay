const { Groq } = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * AIService
 * 
 * Handles all AI interactions using Groq Llama-3 models.
 */
class AIService {
  /**
   * Analyze KYC documents or data to flag anomalies
   * @param {object} kycData - { name, nin, bvn, documentUrl }
   */
  async analyzeKYC(kycData) {
    try {
      const prompt = `
        You are an expert fraud detection analyst. Analyze the following KYC data for a financial platform in Nigeria.
        Data:
        - Name: ${kycData.name}
        - NIN: ${kycData.nin}
        - BVN: ${kycData.bvn}
        
        Tasks:
        1. Check if the NIN and BVN follow the correct 11-digit format.
        2. Identify any common patterns of fraudulent or mismatched data.
        3. Provide a 'risk_level' (low, medium, high) and a 'recommendation' (approve, manual_review, reject).
        
        Return ONLY a JSON object with the following structure:
        {
          "is_valid_format": boolean,
          "risk_level": "low" | "medium" | "high",
          "recommendation": "approve" | "manual_review" | "reject",
          "reason": "string"
        }
      `;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });

      return JSON.parse(chatCompletion.choices[0].message.content);
    } catch (error) {
      console.error('AI KYC Analysis Error:', error);
      return { risk_level: 'medium', recommendation: 'manual_review', reason: 'AI analysis failed' };
    }
  }

  /**
   * Generate personalized credit improvement advice
   * @param {object} userProfile - { name, risk_score, tier, paymentHistory }
   */
  async getCreditCoaching(userProfile) {
    try {
      const prompt = `
        You are a supportive financial coach for Zenda, an installment platform.
        User Profile:
        - Name: ${userProfile.name}
        - Current Risk Score: ${userProfile.risk_score}/100
        - Tier: ${userProfile.tier}
        - Recent History: ${JSON.stringify(userProfile.paymentHistory)}
        
        Tasks:
        1. Explain what their current score means for their borrowing power.
        2. Give 3 actionable, specific tips to improve their score (e.g., pay 2 days early, verify more documents).
        3. Keep the tone encouraging and professional.
        
        Return ONLY a JSON object:
        {
          "summary": "string",
          "tips": ["string", "string", "string"],
          "next_goal": "string"
        }
      `;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });

      return JSON.parse(chatCompletion.choices[0].message.content);
    } catch (error) {
      console.error('AI Coaching Error:', error);
      return { 
        summary: "We're currently unable to generate personalized tips.", 
        tips: ["Pay your installments on time.", "Maintain a good balance."],
        next_goal: "Keep your payments consistent."
      };
    }
  }

  /**
   * General FAQ and Platform Help
   * @param {string} question 
   */
  async askGadgetBot(question) {
    try {
      const prompt = `
        You are 'ZendaBot', the AI assistant for Zenda.
        Zenda is a B2C and B2B installment platform where:
        - Users buy gadgets and pay bit-by-bit (daily, weekly, monthly).
        - We use a Risk Score to determine credit limits.
        - We provide an API for other businesses (B2B) to use our installment endpoint for a 2-3% commission.
        - Users pay us the loan + interest, and we pay the business owner upfront.
        
        Answer this user question concisely: "${question}"
      `;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
      });

      return chatCompletion.choices[0].message.content;
    } catch (error) {
      return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
    }
  }
}

module.exports = new AIService();
