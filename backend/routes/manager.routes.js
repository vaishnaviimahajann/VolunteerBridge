const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');
const {
  getDashboard,
  inviteVolunteer,
  getVolunteerProgress
} = require('../controllers/manager.controller');

router.use(authMiddleware);
router.use(checkRole('manager'));

router.get('/dashboard', getDashboard);
router.post('/invite-volunteer', inviteVolunteer);
router.get('/volunteer-progress/:volunteerId', getVolunteerProgress);

module.exports = router;