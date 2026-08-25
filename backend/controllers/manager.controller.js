const User = require('../models/User');
const Event = require('../models/Event');
const WeeklyProgress = require('../models/Weeklyprogress');
const InviteToken = require('../models/invitetoken');
const generateToken = require('../utils/Generatetoken');
const sendEmail = require('../utils/Sendemail');

const getDashboard = async (req, res) => {
  try {
    const { userId, collegeId } = req.user;
    const volunteersDocs = await User.find({ managerId: userId, role: 'volunteer' }).select('-password');

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
      return evObj;
    });

    // Add 'id' field (from _id) so frontend's volunteer.id works correctly
    const volunteers = volunteersDocs.map((v) => {
      const vObj = v.toObject();
      vObj.id = v._id;
      return vObj;
    });

    res.status(200).json({ volunteers, events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const inviteVolunteer = async (req, res) => {
  try {
    const { name, email } = req.body;
    const { collegeId, userId } = req.user;
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await InviteToken.create({ email, role: 'volunteer', token, collegeId, managerId: userId, expiresAt });
    const inviteLink = `${process.env.CLIENT_URL}/invite-signup?token=${token}`;
    await sendEmail(email, 'volunteer', inviteLink);
    res.status(200).json({ message: `Invite sent to ${email}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVolunteerProgress = async (req, res) => {
  try {
    const { volunteerId } = req.params;

    const volunteer = await User.findById(volunteerId)
      .select('-password')
      .populate('ngoId')
      .populate('collegeId');

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    const collegeId = volunteer.collegeId?._id || volunteer.collegeId;

    const weeklyProgressDocs = await WeeklyProgress.find({ volunteerId }).sort({ weekNumber: 1 });
    const events = await Event.find({ collegeId });

    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - dayOfWeek);
    currentWeekStart.setHours(0, 0, 0, 0);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    const weeklyProgress = weeklyProgressDocs.map((week) => {
      const weekObj = week.toObject();
      weekObj.id = week._id;
      weekObj.isCurrentWeek =
        week.startDate.getTime() === currentWeekStart.getTime() &&
        week.endDate.getTime() === currentWeekEnd.getTime();
      return weekObj;
    });

    res.status(200).json({
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
      },
      ngo: volunteer.ngoId || null,
      collegeName: volunteer.collegeId?.name || '',
      weeklyProgress,
      events,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard, inviteVolunteer, getVolunteerProgress };