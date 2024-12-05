const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { Parser } = require('json2csv');
const moment = require('moment-timezone');
require('dotenv').config();

const User = require('./models/User');
const UserActivity = require('./models/UserActivity');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Atlas Connected'))
  .catch((err) => console.error('MongoDB Connection Failed:', err));

// Register Endpoint
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists!' });
    } else {
      res.status(500).json({ message: 'Server error!' });
    }
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials!' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY, {
      expiresIn: '1h',
    });

    // Log the login event
    const userActivity = new UserActivity({
      userId: user._id,
      action: 'login',
      timestamp: moment().tz('Asia/Kolkata').toDate(), // IST Timezone
    });
    await userActivity.save();

    res.status(200).json({ message: 'Login successful!', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// Logout Endpoint
app.post('/logout', async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userActivity = new UserActivity({
      userId: decoded.id,
      action: 'logout',
      timestamp: moment().tz('Asia/Kolkata').toDate(), // IST Timezone
    });
    await userActivity.save();

    res.status(200).json({ message: 'Logout successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// Generate Report Endpoint (CSV)
app.get('/report', async (req, res) => {
  try {
    const activities = await UserActivity.find().populate('userId', 'email').exec();

    // Prepare data for CSV
    const csvData = activities.map(activity => ({
      user: activity.userId.email,
      action: activity.action,
      timestamp: moment(activity.timestamp).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'), // Convert to IST
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    // Save CSV to file and send as a downloadable response
    const filePath = './user_report.csv';
    fs.writeFileSync(filePath, csv);

    res.download(filePath, 'user_report.csv', (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
      }
      fs.unlinkSync(filePath); // Delete the file after download
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
