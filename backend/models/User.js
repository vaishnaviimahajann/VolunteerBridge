const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['coordinator', 'manager', 'volunteer'],
    required: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College'
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);