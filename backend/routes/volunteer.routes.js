const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');
const {
  getDashboard,
  markAttendance,
  addTask,
  getWeeklyProgress,
  completeNgo
} = require('../controllers/volunteer.controller');

router.use(authMiddleware);
router.use(checkRole('volunteer'));

router.get('/dashboard', getDashboard);
router.post('/mark-attendance', markAttendance);
router.post('/add-task', addTask);
router.get('/weekly-progress', getWeeklyProgress);
router.post('/complete-ngo', completeNgo);

module.exports = router;