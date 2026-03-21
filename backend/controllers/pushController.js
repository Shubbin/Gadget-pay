const webpush = require('web-push');

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

// Only configure VAPID if both keys are provided (generate with: npx web-push generate-vapid-keys)
const vapidConfigured = publicVapidKey && privateVapidKey;
if (vapidConfigured) {
  webpush.setVapidDetails('mailto:support@gadgetflex.com', publicVapidKey, privateVapidKey);
} else {
  console.warn('⚠️  VAPID keys not set — push notifications are disabled. Add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to .env');
}

const { query } = require('../config/db');

exports.subscribe = async (req, res) => {
  const subscription = req.body;
  const userId = req.user ? req.user.id : null;
  
  try {
    if (userId) {
      await query(
        'INSERT INTO subscriptions (user_id, subscription) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, JSON.stringify(subscription)]
      );
    }
    
    res.status(201).json({ message: 'Subscribed successfully' });
    
    // Test Push
    const payload = JSON.stringify({ 
      title: 'Welcome to GadgetFlex!', 
      body: 'Notifications are now enabled.' 
    });
    webpush.sendNotification(subscription, payload).catch(error => console.error(error));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.broadcast = async (req, res) => {
  const { title, body } = req.body;
  
  try {
    const { rows: subscriptions } = await query('SELECT subscription FROM subscriptions');
    
    const payload = JSON.stringify({ title, body });
    
    const sendPromises = subscriptions.map(sub => 
      webpush.sendNotification(sub.subscription, payload).catch(error => {
        console.error('Broadcast error for subscription:', error.message);
        // Optional: Delete expired subscriptions
      })
    );
    
    await Promise.all(sendPromises);
    res.json({ message: `Broadcast sent to ${subscriptions.length} users` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
