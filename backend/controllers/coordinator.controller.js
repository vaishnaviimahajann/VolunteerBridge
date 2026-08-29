const User = require('../models/User');
const NGO = require('../models/Ngo');
const Event = require('../models/Event');
const WeeklyProgress = require('../models/Weeklyprogress');
const InviteToken = require('../models/InviteToken');
const generateToken = require('../utils/Generatetoken');
const sendEmail = require('../utils/Sendemail');

const getDashboard = async (req, res) => {
  try {
    const { collegeId } = req.user;

    const managersDocs = await User.find({ collegeId, role: 'manager' }).select('-password');
    const ngos = await NGO.find({ collegeId });
    const eventDocs = await Event.find({ collegeId }).sort({ date: 1 });

    // Add 'id' field so frontend delete/edit actions work
    const upcomingEvents = eventDocs.map((ev) => {
      const evObj = ev.toObject();
      evObj.id = ev._id;
      return evObj;
    });

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const todaysEvent = eventDocs.find((ev) => {
      const d = new Date(ev.date);
      return d >= todayStart && d <= todayEnd;
    });

    const managers = await Promise.all(
      managersDocs.map(async (manager) => {
        const ngo = ngos.find((n) => String(n.managerId) === String(manager._id));

        const volunteerDocs = await User.find({
          managerId: manager._id,
          role: 'volunteer',
        }).select('-password');

        const volunteers = await Promise.all(
          volunteerDocs.map(async (v) => {
            const weeklyProgress = await WeeklyProgress.find({ volunteerId: v._id });
            const totalHours = weeklyProgress.reduce(
              (sum, w) => sum + (w.totalHours || 0),
              0
            );

            let status = 'not-marked';
            if (todaysEvent) {
              const attended = todaysEvent.attendees?.some(
                (a) => String(a) === String(v._id)
              );
              status = attended ? 'present' : 'not-marked';
            }

            return {
              id: v._id,
              name: v.name,
              totalHours,
              status,
            };
          })
        );

        return {
          id: manager._id,
          name: manager.name,
          ngoName: ngo?.name || '',
          volunteerCount: volunteers.length,
          volunteers,
        };
      })
    );

    res.status(200).json({ managers, upcomingEvents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const inviteManager = async (req, res) => {
  try {
    const { name, email } = req.body;
    const { collegeId } = req.user;
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await InviteToken.create({ email, role: 'manager', token, collegeId, expiresAt });
    const inviteLink = `${process.env.CLIENT_URL}/invite-signup?token=${token}`;
    await sendEmail(email, 'manager', inviteLink);
    res.status(200).json({ message: `Invite sent to ${email}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addNGO = async (req, res) => {
  try {
    const { name, managerId, startDate, endDate } = req.body;
    const { collegeId } = req.user;
    const ngo = await NGO.create({ name, collegeId, managerId, startDate, endDate });
    res.status(201).json({ message: 'NGO added successfully', ngo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const planEvent = async (req, res) => {
  try {
    const { name, date } = req.body;
    const { collegeId, userId } = req.user;
    const event = await Event.create({ name, date, collegeId, createdBy: userId });
    res.status(201).json({ message: 'Event planned successfully', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deletes an event — only if it belongs to the coordinator's own college.
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { collegeId } = req.user;

    const event = await Event.findOne({ _id: eventId, collegeId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndDelete(eventId);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getManagers = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const managers = await User.find({ collegeId, role: 'manager' }).select('-password');
    res.status(200).json({ managers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getManagerDetail = async (req, res) => {
  try {
    const { managerId } = req.params;
    const { collegeId } = req.user;

    const manager = await User.findOne({ _id: managerId, collegeId, role: 'manager' }).select('-password');
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    const ngo = await NGO.findOne({ managerId: manager._id, collegeId });
    const events = await Event.find({ collegeId });

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const todaysEvent = events.find((ev) => {
      const d = new Date(ev.date);
      return d >= todayStart && d <= todayEnd;
    });

    const volunteerDocs = await User.find({
      managerId: manager._id,
      role: 'volunteer',
    }).select('-password');

    const volunteers = await Promise.all(
      volunteerDocs.map(async (v) => {
        const weeklyProgress = await WeeklyProgress.find({ volunteerId: v._id });
        const totalHours = weeklyProgress.reduce(
          (sum, w) => sum + (w.totalHours || 0),
          0
        );

        let status = 'not-marked';
        if (todaysEvent) {
          const attended = todaysEvent.attendees?.some(
            (a) => String(a) === String(v._id)
          );
          status = attended ? 'present' : 'not-marked';
        }

        return {
          id: v._id,
          name: v.name,
          totalHours,
          status,
        };
      })
    );

    res.status(200).json({
      manager: { id: manager._id, name: manager.name, email: manager.email },
      ngoName: ngo?.name || '',
      volunteers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVolunteerProgress = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { collegeId } = req.user;

    const volunteer = await User.findOne({ _id: volunteerId, collegeId })
      .select('-password')
      .populate('ngoId')
      .populate('collegeId');

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

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
      ngoStatus: volunteer.ngoStatus || "active",
      collegeName: volunteer.collegeId?.name || '',
      weeklyProgress,
      events,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboard,
  inviteManager,
  addNGO,
  planEvent,
  deleteEvent,
  getManagers,
  getManagerDetail,
  getVolunteerProgress,
};
