const User = require('../models/User');
const NGO = require('../models/Ngo');
const Event = require('../models/Event');
const WeeklyProgress = require('../models/Weeklyprogress');

const getDashboard = async (req, res) => {
  try {
    const { userId, collegeId } = req.user;
    const volunteer = await User.findById(userId).select('-password').populate('ngoId');

    // Only fetch events that are today or in the future — past events
    // shouldn't show up in "Upcoming Events"
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const eventDocs = await Event.find({
      collegeId,
      date: { $gte: todayStart },
    }).sort({ date: 1 });

    const events = eventDocs.map((ev) => {
      const evObj = ev.toObject();
      evObj.id = ev._id;
      const d = new Date(ev.date);
      evObj.isToday = d >= todayStart && d <= todayEnd;
      evObj.attended = ev.attendees?.some((a) => String(a) === String(userId)) || false;
      return evObj;
    });

    const weeklyProgress = await WeeklyProgress.find({ volunteerId: userId });
    res.status(200).json({
      volunteer,
      ngo: volunteer.ngoId || null,              // 👈 NAYI LINE — ye missing thi
      collegeName: volunteer.collegeId?.name || '', // 👈 bonus fix — college naam bhi ab sahi aayega
      events,
      weeklyProgress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { eventId } = req.body;
    const { userId } = req.user;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.attendees.includes(userId)) return res.status(400).json({ message: 'Attendance already marked' });
    event.attendees.push(userId);
    await event.save();
    res.status(200).json({ message: 'Attendance marked successfully', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTask = async (req, res) => {
  try {
    const { taskName, hoursSpent } = req.body;
    const { userId } = req.user;
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    let weeklyProgress = await WeeklyProgress.findOne({ volunteerId: userId, startDate: { $lte: now }, endDate: { $gte: now } });
    if (!weeklyProgress) {
      const allProgress = await WeeklyProgress.find({ volunteerId: userId });
      const weekNumber = allProgress.length + 1;
      weeklyProgress = await WeeklyProgress.create({ volunteerId: userId, weekNumber, startDate, endDate, tasks: [], totalHours: 0 });
    }
    weeklyProgress.tasks.push({ taskName, hoursSpent });
    weeklyProgress.totalHours += hoursSpent;
    await weeklyProgress.save();
    res.status(200).json({ message: 'Task added successfully', weeklyProgress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWeeklyProgress = async (req, res) => {
  try {
    const { userId } = req.user;
    const progress = await WeeklyProgress.find({ volunteerId: userId }).sort({ weekNumber: 1 });
    res.status(200).json({ progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard, markAttendance, addTask, getWeeklyProgress };