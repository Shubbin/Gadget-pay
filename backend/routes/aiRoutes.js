const express = require('express');
const router = express.Router();
const { getRecommendations, getPersonalizedSuggestions } = require('../controllers/aiController');
const { chatWithAssistant } = require('../controllers/assistantController');
const { protect } = require('../middleware/authMiddleware');

router.get('/ping', (req, res) => res.json({ message: 'AI Service Online' }));
router.get('/recommendations/:productId', getRecommendations);
router.get('/suggestions', protect, getPersonalizedSuggestions);
router.post('/chat', protect, chatWithAssistant);

module.exports = router;
