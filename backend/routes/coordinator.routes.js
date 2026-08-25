const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');
const {
  getDashboard,
  inviteManager,
  addNGO,
  planEvent,
  deleteEvent,
  getManagers,
  getManagerDetail,
  getVolunteerProgress,
} = require('../controllers/coordinator.controller');

// All routes protected — coordinator only
router.use(authMiddleware);
router.use(checkRole('coordinator'));

router.get('/dashboard', getDashboard);
router.post('/invite-manager', inviteManager);
router.post('/add-ngo', addNGO);
router.post('/plan-event', planEvent);
router.delete('/event/:eventId', deleteEvent);
router.get('/managers', getManagers);
router.get('/manager/:managerId', getManagerDetail);
router.get('/volunteer-progress/:volunteerId', getVolunteerProgress);

module.exports = router;