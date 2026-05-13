const webpush = require('web-push');
const supabase = require('../config/supabase');

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

// Only configure VAPID if both keys are provided
const vapidConfigured = publicVapidKey && privateVapidKey;
if (vapidConfigured) {
  webpush.setVapidDetails('mailto:support@gadgetflex.com', publicVapidKey, privateVapidKey);
} else {
  console.warn('⚠️  VAPID keys not set — push notifications are disabled.');
}

exports.subscribe = async (req, res) => {
  const subscription = req.body;
  const userId = req.user ? req.user.id : null;
  
  try {
    if (userId) {
      await supabase
        .from('subscriptions')
        .upsert({ user_id: userId, subscription: subscription }, { onConflict: 'user_id,subscription' });
    }
    
    res.status(201).json({ message: 'Subscribed successfully' });
    
    // Test Push
    if (vapidConfigured) {
      const payload = JSON.stringify({ 
        title: 'Welcome to GadgetFlex!', 
        body: 'Notifications are now enabled.' 
      });
      webpush.sendNotification(subscription, payload).catch(error => console.error(error));
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.broadcast = async (req, res) => {
  const { title, body } = req.body;
  
  try {
    const { data: subscriptions, error } = await supabase.from('subscriptions').select('subscription');
    if (error) throw error;
    
    const payload = JSON.stringify({ title, body });
    
    const sendPromises = (subscriptions || []).map(sub => 
      webpush.sendNotification(sub.subscription, payload).catch(error => {
        console.error('Broadcast error for subscription:', error.message);
      })
    );
    
    await Promise.all(sendPromises);
    res.json({ message: `Broadcast sent to ${subscriptions.length} users` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
