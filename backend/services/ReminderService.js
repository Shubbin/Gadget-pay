const supabase = require('../config/supabase');
const { Groq } = require('groq-sdk');
const emailService = require('./emailService');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * ReminderService
 * 
 * Automates AI-powered payment reminders for Zenda installments.
 */
class ReminderService {
  /**
   * Run the daily reminder check
   */
  async processDailyReminders() {
    try {
      console.log('[ReminderService] Checking for upcoming payments...');

      // 1. Fetch installments due in the next 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const { data: installments, error } = await supabase
        .from('installments')
        .select(`
          *,
          user:user_id(id, name, email),
          order:order_id(id, amount, product:product_id(name))
        `)
        .eq('status', 'active')
        .lte('next_payment_date', threeDaysFromNow.toISOString())
        .gte('next_payment_date', new Date().toISOString());

      if (error) throw error;
      if (!installments || installments.length === 0) {
        console.log('[ReminderService] No upcoming payments found.');
        return;
      }

      console.log(`[ReminderService] Found ${installments.length} upcoming payments.`);

      for (const inst of installments) {
        await this.sendAIReminder(inst);
      }
    } catch (error) {
      console.error('[ReminderService Error]:', error.message);
    }
  }

  /**
   * Generate and send a personalized AI reminder
   */
  async sendAIReminder(inst) {
    try {
      const { user, order, remaining_balance, next_payment_date } = inst;
      const productName = order.product?.name || 'your gadget';

      // 2. Generate AI Message using Groq
      const prompt = `
        You are 'Zenda', the friendly AI assistant for Zenda.
        Task: Write a short, encouraging payment reminder for a customer.
        Customer: ${user.name}
        Gadget: ${productName}
        Balance Due: ${remaining_balance}
        Due Date: ${new Date(next_payment_date).toDateString()}
        
        Rules:
        - Be professional but very friendly and supportive.
        - Mention that on-time payments help improve their 'FlexScore' for future gadgets.
        - Keep it under 60 words.
      `;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
      });

      const message = chatCompletion.choices[0].message.content;

      // 3. Save Notification to Database
      await supabase.from('notifications').insert([{
        user_id: user.id,
        title: 'Payment Reminder 🚀',
        message: message,
        type: 'payment_reminder'
      }]);

      // 4. Send Email
      await emailService.sendGeneralEmail(
        user.email,
        'Upcoming Installment Reminder 📱',
        message
      );

      console.log(`[ReminderService] Reminder sent to ${user.email} for ${productName}`);
    } catch (error) {
      console.error(`[ReminderService] Failed to send reminder to ${inst.user?.email}:`, error.message);
    }
  }
}

module.exports = new ReminderService();
