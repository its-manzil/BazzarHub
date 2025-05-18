require('dotenv').config();
const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 8099;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
});

// Database connection
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "BazzarHub",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify Token Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }
    
    req.userId = decoded.id;
    next();
  });
};

// Routes
app.post('/api/signup', upload.single('profile_picture'), async (req, res) => {
  try {
    const { username, email, phone, full_name, password } = req.body;
    
    // Check if user already exists
    const [existingUser] = await db.query(
      'SELECT * FROM customers WHERE email = ? OR username = ? OR phone = ?',
      [email, username, phone]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User with this email, username or phone already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const profilePicture = req.file ? req.file.filename : null;
    
    const [result] = await db.query(
      'INSERT INTO customers (username, email, phone, full_name, password, profile_picture) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, phone, full_name, hashedPassword, profilePicture]
    );
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    // Find user by email, username, or phone
    const [users] = await db.query(
      'SELECT * FROM customers WHERE email = ? OR username = ? OR phone = ?',
      [identifier, identifier, identifier]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    
    // Return user data (excluding password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      full_name: user.full_name,
      profile_picture: user.profile_picture,
      created_at: user.created_at
    };
    
    res.json({ token, user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

app.get('/api/profile/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verify the requested profile matches the authenticated user
    if (parseInt(userId) !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const [users] = await db.query(
      'SELECT id, username, email, phone, full_name, profile_picture, created_at FROM customers WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update Profile
app.put('/api/profile/:id', verifyToken, upload.single('profile_picture'), async (req, res) => {
  try {
    const userId = req.params.id;
    if (parseInt(userId) !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { full_name, username, email, phone, currentPassword, newPassword } = req.body;
    
    // Check if new username/email/phone already exists
    const [existing] = await db.query(
      `SELECT * FROM customers 
       WHERE (email = ? OR username = ? OR phone = ?) 
       AND id != ?`,
      [email, username, phone, userId]
    );
    
    if (existing.length > 0) {
      const conflict = existing[0];
      if (conflict.email === email) {
        return res.status(400).json({ field: 'email', message: 'Email already in use' });
      }
      if (conflict.username === username) {
        return res.status(400).json({ field: 'username', message: 'Username already taken' });
      }
      if (conflict.phone === phone) {
        return res.status(400).json({ field: 'phone', message: 'Phone number already in use' });
      }
    }

    // Verify current password if changing password
    if (currentPassword) {
      const [users] = await db.query('SELECT password FROM customers WHERE id = ?', [userId]);
      const user = users[0];
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ field: 'currentPassword', message: 'Current password is incorrect' });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.query('UPDATE customers SET password = ? WHERE id = ?', [hashedPassword, userId]);
    }

    // Update profile
    const profilePicture = req.file ? req.file.filename : null;
    const updateFields = {
      full_name,
      username,
      email,
      phone,
      ...(profilePicture && { profile_picture: profilePicture })
    };

    await db.query('UPDATE customers SET ? WHERE id = ?', [updateFields, userId]);

    // Get updated user data
    const [updatedUser] = await db.query(
      'SELECT id, username, email, phone, full_name, profile_picture, created_at FROM customers WHERE id = ?',
      [userId]
    );

    res.json({ user: updatedUser[0] });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Get User Orders
app.get('/api/orders/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (parseInt(userId) !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const [orders] = await db.query(
      `SELECT o.order_id, o.total_amount, o.order_status, o.created_at 
       FROM orders o
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json({ orders });
  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});