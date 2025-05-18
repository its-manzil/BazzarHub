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

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const valid = filetypes.test(path.extname(file.originalname).toLowerCase()) && filetypes.test(file.mimetype);
    cb(valid ? null : 'Only images allowed', valid);
  }
});

// MySQL Pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "manjil@123",
  database: "BazzarHub",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware: Verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token invalid' });
    req.userId = decoded.id;
    next();
  });
};

// Signup
app.post('/api/signup', upload.single('profile_picture'), async (req, res) => {
  try {
    const { username, email, phone, full_name, password } = req.body;

    const [existingUser] = await db.query(
      'SELECT * FROM customers WHERE email = ? OR username = ? OR phone = ?',
      [email, username, phone]
    );
    if (existingUser.length > 0) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePicture = req.file ? req.file.filename : null;

    await db.query(
      'INSERT INTO customers (username, email, phone, full_name, password, profile_picture) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, phone, full_name, hashedPassword, profilePicture]
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const [users] = await db.query(
      'SELECT * FROM customers WHERE email = ? OR username = ? OR phone = ?',
      [identifier, identifier, identifier]
    );
    if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

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

// Get Profile
app.get('/api/profile/:id', verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

    const [users] = await db.query(
      'SELECT id, username, email, phone, full_name, profile_picture, created_at FROM customers WHERE id = ?',
      [userId]
    );
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update Profile
app.put('/api/profile/:id', verifyToken, upload.single('profile_picture'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

    const { full_name, username, email, phone, currentPassword, newPassword } = req.body;

    const [existing] = await db.query(
      'SELECT * FROM customers WHERE (email = ? OR username = ? OR phone = ?) AND id != ?',
      [email, username, phone, userId]
    );

    if (existing.length > 0) {
      const conflict = existing[0];
      if (conflict.email === email) return res.status(400).json({ field: 'email', message: 'Email already in use' });
      if (conflict.username === username) return res.status(400).json({ field: 'username', message: 'Username already in use' });
      if (conflict.phone === phone) return res.status(400).json({ field: 'phone', message: 'Phone already in use' });
    }

    // Change password if fields provided
    if (currentPassword && newPassword) {
      const [users] = await db.query('SELECT password FROM customers WHERE id = ?', [userId]);
      const user = users[0];
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ field: 'currentPassword', message: 'Incorrect current password' });

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await db.query('UPDATE customers SET password = ? WHERE id = ?', [hashedNewPassword, userId]);
    }

    // Update other fields
    const profilePicture = req.file ? req.file.filename : null;
    const updateFields = {
      full_name,
      username,
      email,
      phone,
      ...(profilePicture && { profile_picture: profilePicture })
    };

    await db.query('UPDATE customers SET ? WHERE id = ?', [updateFields, userId]);

    const [updatedUser] = await db.query(
      'SELECT id, username, email, phone, full_name, profile_picture, created_at FROM customers WHERE id = ?',
      [userId]
    );

    res.json({ user: updatedUser[0] });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Get User Orders
app.get('/api/orders/:userId', verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (userId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

    const [orders] = await db.query(
      'SELECT order_id, total_amount, order_status, created_at FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({ orders });
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Cancel Order
app.put('/api/orders/:orderId/cancel', verifyToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);

    const [orders] = await db.query('SELECT customer_id, order_status FROM orders WHERE order_id = ?', [orderId]);
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
    if (orders[0].customer_id !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
    if (orders[0].order_status !== 'pending') return res.status(400).json({ message: 'Only pending orders can be cancelled' });

    await db.query('UPDATE orders SET order_status = "cancelled" WHERE order_id = ?', [orderId]);
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Error cancelling order' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
