const express = require('express');
const router = express.Router();
const { register, login, inviteSignup, getInviteInfo } = require('../controllers/auth.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/invite-info', getInviteInfo);
router.post('/invite-signup', inviteSignup);

module.exports = router;
