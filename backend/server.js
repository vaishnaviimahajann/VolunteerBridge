const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/coordinator', require('./routes/coordinator.routes'));
app.use('/api/manager', require('./routes/manager.routes'));
app.use('/api/volunteer', require('./routes/volunteer.routes'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'VolunteerBridge API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});