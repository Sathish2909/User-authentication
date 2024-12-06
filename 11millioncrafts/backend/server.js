const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const { Parser } = require('json2csv');
const moment = require('moment-timezone');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const UserActivity = require('./models/UserActivity'); // Import UserActivity model

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve static files from the 'uploads' directory

// Multer Configuration for Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Atlas Connected'))
  .catch((err) => console.error('MongoDB Connection Failed:', err));

// User Registration
app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error during registration:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists!' });
    } else {
      res.status(500).json({ message: 'Server error!' });
    }
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  try {
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ message: 'Invalid email or role!' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials!' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.SECRET_KEY, {
      expiresIn: '1h',
    });

    // Log the login action
    const userActivity = new UserActivity({
      userId: user._id,
      action: 'login',
      timestamp: moment().tz('Asia/Kolkata').toDate(),
    });
    await userActivity.save();

    res.status(200).json({ message: 'Login successful!', token, role: user.role });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error!' });
  }
});

// User Logout
app.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(400).json({ message: 'Token is required!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Log the logout action
    const userActivity = new UserActivity({
      userId: user._id,
      action: 'logout',
      timestamp: moment().tz('Asia/Kolkata').toDate(),
    });
    await userActivity.save();

    res.status(200).json({ message: 'Logout successful!' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Server error!' });
  }
});

// Add Product with Image Upload
app.post('/api/products', upload.single('image'), async (req, res) => {
  const { name, productId } = req.body;

  if (!name || !productId) {
    return res.status(400).json({ message: 'Product name and ID are required!' });
  }

  try {
    const productData = {
      name,
      productId,
      image: req.file ? req.file.path : null, // Save image path
    };

    const newProduct = new Product(productData);
    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully!' });
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ message: 'Server error!' });
  }
});

// Fetch Products
app.get('/inventory', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Generate Login/Logout Report (CSV)
// app.get('/report', async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     jwt.verify(token, process.env.SECRET_KEY);

//     const activities = await UserActivity.find().populate('userId', 'email').exec();

//     const csvData = activities.map(activity => ({
//       user: activity.userId.email,
//       action: activity.action,
//       timestamp: moment(activity.timestamp).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
//     }));

//     const parser = new Parser();
//     const csv = parser.parse(csvData);

//     res.header('Content-Type', 'text/csv');
//     res.attachment('user_report.csv');
//     res.status(200).send(csv);
//   } catch (error) {
//     console.error('Error generating report:', error);
//     res.status(500).json({ message: 'Failed to generate report' });
//   }
// });
app.get('/report', async (req, res) => {
  try {
    // Verify the token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required!' });
    }
    jwt.verify(token, process.env.SECRET_KEY);

    // Fetch activities and populate user details
    const activities = await UserActivity.find().populate('userId', 'email role').exec();

    // Separate actions by role
    const csvData = activities.map(activity => ({
      user: activity.userId.email,
      role: activity.userId.role, // Include role in the report
      action: activity.action,
      timestamp: moment(activity.timestamp).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    // Send the CSV file as a response
    res.header('Content-Type', 'text/csv');
    res.attachment('user_activity_report.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
