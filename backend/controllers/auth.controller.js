const User = require('../models/User');
const College = require('../models/College');
const InviteToken = require('../models/InviteToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateJWT = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      role: user.role, 
      collegeId: user.collegeId 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register Coordinator
const register = async (req, res) => {
  try {
    const { name, email, password, collegeName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create college first
    const college = await College.create({ 
      name: collegeName,
      coordinatorId: null
    });

    // Create coordinator
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'coordinator',
      collegeId: college._id
    });

    // Update college with coordinatorId
    college.coordinatorId = user._id;
    await college.save();

    const token = generateJWT(user);

    res.status(201).json({
      message: 'Coordinator registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateJWT(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Invite Signup
const inviteSignup = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    // Find invite token
    const invite = await InviteToken.findOne({ token, used: false });
    if (!invite) {
      return res.status(400).json({ message: 'Invalid or expired invite link' });
    }

    // Check if expired
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invite link has expired' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: invite.email,
      password: hashedPassword,
      role: invite.role,
      collegeId: invite.collegeId,
      managerId: invite.managerId || null
    });

    // Mark token as used
    invite.used = true;
    await invite.save();

    const jwtToken = generateJWT(user);

    res.status(201).json({
      message: 'Account created successfully',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, inviteSignup };