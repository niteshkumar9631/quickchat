const express = require('express');
const router = express.Router();
const { 
  getUsersForSidebar, 
  getMessages, 
  sendMessage, 
  deleteMessage,
  markAsSeen
} = require('../controllers/message.controller');
const protectRoute = require('../middleware/auth.middleware');

router.get('/users', protectRoute, getUsersForSidebar);
router.get('/:id', protectRoute, getMessages);
router.post('/send/:id', protectRoute, sendMessage);
router.delete('/:id', protectRoute, deleteMessage);
router.put('/seen/:id', protectRoute, markAsSeen);

module.exports = router;