const express = require('express');
const router = express.Router();
const { register, login, inviteSignup } = require('../controllers/auth.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/invite-signup', inviteSignup);

module.exports = router;