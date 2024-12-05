const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Import multer for handling file uploads
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/product');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



// Serve static files from 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Setup multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Define the folder where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null,file.originalname); // Add timestamp to file name
  },
});

const upload = multer({ storage: storage });

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

    res.status(200).json({ message: 'Login successful!', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// Add Product Endpoint with Image Upload
app.post('/api/products', upload.single('image'), async (req, res) => {
  const { name, productId } = req.body;

  // Log the incoming request for debugging
  console.log('Received Product Data:', req.body);

  if (!name || !productId) {
    return res.status(400).json({ message: 'Product name and ID are required!' });
  }

  try {
    // If an image is uploaded, req.file will contain the file details
    const productData = {
      name,
      productId,
      image: req.file ? req.file.path : null, // Save the image path (file path)
    };

    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully!' });
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ message: 'Server error!' });
  }
});

// Get Products Endpoint
app.get('/inventory', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
