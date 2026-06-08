const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile } = require('../controllers/auth.controller');
const protectRoute = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protectRoute, logout);
router.get('/me', protectRoute, getMe);
router.put('/update-profile', protectRoute, updateProfile);

module.exports = router;