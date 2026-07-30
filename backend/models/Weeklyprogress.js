const mongoose = require('mongoose');

const weeklyProgressSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekNumber: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  tasks: [
    {
      taskName: {
        type: String,
        required: true
      },
      hoursSpent: {
        type: Number,
        required: true
      }
    }
  ],
  totalHours: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('WeeklyProgress', weeklyProgressSchema);