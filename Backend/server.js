const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const app = express();
const port = 8099;

// Generate a secure random secret key for JWT at startup
const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
};
const JWT_SECRET = generateSecretKey();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/Users/manzil/Developer/All-Projects/BazzarHub/Backend/uploads');
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

// Authentication Routes
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

// Profile Routes
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

app.put('/api/profile/:id', verifyToken, upload.single('profile_picture'), async (req, res) => {
  try {
    const userId = req.params.id;
    if (parseInt(userId) !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { full_name, username, email, phone } = req.body;
    
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

app.put('/api/profile/:id/password', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    if (parseInt(userId) !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;
    
    // Get current password hash
    const [users] = await db.query('SELECT password FROM customers WHERE id = ?', [userId]);
    const user = users[0];
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ field: 'currentPassword', message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.query('UPDATE customers SET password = ? WHERE id = ?', [hashedPassword, userId]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

app.delete('/api/profile/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    if (parseInt(userId) !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Verify password
    const [users] = await db.query('SELECT password FROM customers WHERE id = ?', [userId]);
    const user = users[0];
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Delete user account
    await db.query('DELETE FROM customers WHERE id = ?', [userId]);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

// Order Routes
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

app.put('/api/orders/:orderId/cancel', verifyToken, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    // Verify the order belongs to the user
    const [orders] = await db.query(
      'SELECT customer_id, order_status FROM orders WHERE order_id = ?',
      [orderId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (orders[0].customer_id !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Check if order can be cancelled (only pending orders)
    if (orders[0].order_status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }
    
    // Update order status
    await db.query(
      'UPDATE orders SET order_status = "cancelled" WHERE order_id = ?',
      [orderId]
    );
    
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Error cancelling order' });
  }
});

// Add this to your server.js after the other routes

// Products Routes
app.post('/api/products', upload.array('images', 5), async (req, res) => {
  try {
    // Extract form data
    const { productName, brand, category, description, variants } = req.body;
    
    // Basic validation
    if (!productName || !brand || !category || !description || !variants) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create product in database
    const [productResult] = await db.query(
      'INSERT INTO products (product_name, brand, category, description) VALUES (?, ?, ?, ?)',
      [productName, brand, category, description]
    );
    
    const productId = productResult.insertId;
    
    // Process uploaded images
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.query(
          'INSERT INTO item_images (product_id, image_url) VALUES (?, ?)',
          [productId, file.filename]
        );
        imageUrls.push(file.filename);
      }
    }

    // Process product variants
    let parsedVariants;
    try {
      parsedVariants = JSON.parse(variants);
      if (!Array.isArray(parsedVariants)) {
        throw new Error('Variants must be an array');
      }
    } catch (e) {
      return res.status(400).json({ message: 'Invalid variants format' });
    }

    for (const variant of parsedVariants) {
      // Validate variant data
      if (!variant.type || !variant.value || !variant.markedPrice || !variant.sellingPrice || !variant.stockQuantity) {
        return res.status(400).json({ message: 'All variant fields are required' });
      }

      await db.query(
        `INSERT INTO product_variants 
        (product_id, variant_name, variant_value, marked_price, selling_price, stock_quantity) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          productId,
          variant.type,
          variant.value,
          variant.markedPrice,
          variant.sellingPrice,
          variant.stockQuantity
        ]
      );
    }
    
    // Success response
    res.status(201).json({ 
      success: true,
      message: 'Product created successfully',
      productId,
      imageUrls
    });
    
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// Add these endpoints to your existing server.js file

// Get all products with variants and images
app.get('/api/storeProducts', async (req, res) => {
  try {
    // Get query parameters for filtering/sorting
    const { category, sort } = req.query;

    // Base query
    let query = `
      SELECT 
        p.product_id, 
        p.product_name, 
        p.brand, 
        p.description, 
        p.category,
        p.created_at
      FROM products p
      WHERE 1=1
    `;

    // Add category filter if provided
    const queryParams = [];
    if (category && category !== 'All') {
      query += ' AND p.category = ?';
      queryParams.push(category);
    }

    // Add sorting
    if (sort) {
      switch (sort) {
        case 'newest':
          query += ' ORDER BY p.created_at DESC';
          break;
        case 'oldest':
          query += ' ORDER BY p.created_at ASC';
          break;
        case 'alphabetical':
          query += ' ORDER BY p.product_name ASC';
          break;
        // Price sorting will be handled after variants are fetched
      }
    } else {
      query += ' ORDER BY p.created_at DESC';
    }

    // Get products
    const [products] = await db.query(query, queryParams);

    // Get variants and images for each product
    for (const product of products) {
      // Get variants
      const [variants] = await db.query(
        `SELECT 
          variant_id, 
          variant_name, 
          variant_value, 
          marked_price, 
          selling_price, 
          stock_quantity 
        FROM product_variants 
        WHERE product_id = ?`,
        [product.product_id]
      );
      product.variants = variants || [];

      // Get images
      const [images] = await db.query(
        'SELECT image_id, image_url FROM item_images WHERE product_id = ?',
        [product.product_id]
      );
      product.images = images || [];

      // Try to get ratings (handle case where table doesn't exist)
      try {
        const [ratings] = await db.query(
          `SELECT 
            AVG(rating) as avg_rating,
            COUNT(*) as review_count
          FROM product_ratings
          WHERE product_id = ?`,
          [product.product_id]
        );
        product.rating = ratings[0]?.avg_rating || null;
        product.reviewCount = ratings[0]?.review_count || 0;
      } catch (error) {
        // If ratings table doesn't exist or query fails
        console.log('Ratings not available:', error.message);
        product.rating = null;
        product.reviewCount = 0;
      }
    }

    // Handle price sorting if needed (must be done after variants are fetched)
    if (sort === 'priceHigh' || sort === 'priceLow') {
      products.sort((a, b) => {
        const getPrice = (product, type) => {
          if (!product.variants || product.variants.length === 0) return 0;
          const prices = product.variants.map(v => v.selling_price);
          return type === 'max' ? Math.max(...prices) : Math.min(...prices);
        };

        const priceA = sort === 'priceHigh' ? getPrice(a, 'max') : getPrice(a, 'min');
        const priceB = sort === 'priceHigh' ? getPrice(b, 'max') : getPrice(b, 'min');
        
        return sort === 'priceHigh' ? priceB - priceA : priceA - priceB;
      });
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get single product details
app.get('/api/storeProducts/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Get product details
    const [products] = await db.query(
      `SELECT 
        p.product_id, 
        p.product_name, 
        p.brand, 
        p.description, 
        p.category,
        p.created_at
      FROM products p
      WHERE p.product_id = ?`,
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = products[0];

    // Get variants
    const [variants] = await db.query(
      `SELECT 
        variant_id, 
        variant_name, 
        variant_value, 
        marked_price, 
        selling_price, 
        stock_quantity,
        sku
      FROM product_variants 
      WHERE product_id = ?
      ORDER BY variant_name, variant_value`,
      [productId]
    );
    product.variants = variants;

    // Get images
    const [images] = await db.query(
      'SELECT image_id, image_url FROM item_images WHERE product_id = ? ORDER BY image_id',
      [productId]
    );
    product.images = images;

    // Get ratings
    const [ratings] = await db.query(
      `SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as review_count
      FROM product_ratings
      WHERE product_id = ?`,
      [productId]
    );
    product.rating = ratings[0]?.avg_rating || null;
    product.reviewCount = ratings[0]?.review_count || 0;

    // Get similar products (by category)
    const [similarProducts] = await db.query(
      `SELECT 
        p.product_id, 
        p.product_name,
        p.brand,
        (SELECT image_url FROM item_images WHERE product_id = p.product_id LIMIT 1) as main_image,
        (SELECT MIN(selling_price) FROM product_variants WHERE product_id = p.product_id) as min_price
      FROM products p
      WHERE p.category = ? AND p.product_id != ?
      LIMIT 4`,
      [product.category, productId]
    );
    product.similarProducts = similarProducts;

    res.json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Error fetching product details' });
  }
});

// Add to cart endpoint
app.post('/api/cart', verifyToken, async (req, res) => {
  try {
    const { userId } = req; // From verifyToken middleware
    const { productId, variantId, quantity } = req.body;

    // Validate input
    if (!productId || !variantId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid cart data' });
    }

    // Check if product variant exists
    const [variants] = await db.query(
      `SELECT 
        p.product_id,
        p.product_name,
        pv.variant_id,
        pv.variant_name,
        pv.variant_value,
        pv.selling_price,
        pv.stock_quantity
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.product_id
      WHERE pv.variant_id = ? AND pv.product_id = ?`,
      [variantId, productId]
    );

    if (variants.length === 0) {
      return res.status(404).json({ message: 'Product variant not found' });
    }

    const variant = variants[0];

    // Check stock availability
    if (variant.stock_quantity < quantity) {
      return res.status(400).json({ 
        message: 'Not enough stock available',
        available: variant.stock_quantity
      });
    }

    // Check if item already in cart
    const [existingCartItems] = await db.query(
      `SELECT cart_item_id, quantity 
       FROM cart_items 
       WHERE user_id = ? AND product_id = ? AND variant_id = ?`,
      [userId, productId, variantId]
    );

    if (existingCartItems.length > 0) {
      // Update quantity
      const newQuantity = existingCartItems[0].quantity + quantity;
      await db.query(
        `UPDATE cart_items 
         SET quantity = ?
         WHERE cart_item_id = ?`,
        [newQuantity, existingCartItems[0].cart_item_id]
      );
    } else {
      // Add new item to cart
      await db.query(
        `INSERT INTO cart_items 
         (user_id, product_id, variant_id, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, productId, variantId, quantity, variant.selling_price]
      );
    }

    res.json({ 
      success: true,
      message: 'Product added to cart'
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

// Add these endpoints to your existing server.js

// Get product comments
app.get('/api/products/:id/comments', async (req, res) => {
  try {
    const productId = req.params.id;

    const [comments] = await db.query(
      `SELECT 
        pc.comment_id,
        pc.text,
        pc.created_at,
        c.id as user_id,
        c.full_name,
        c.profile_picture,
        (SELECT AVG(rating) FROM product_ratings WHERE product_id = ?) as avg_rating
      FROM product_comments pc
      JOIN customers c ON pc.user_id = c.id
      WHERE pc.product_id = ?
      ORDER BY pc.created_at DESC`,
      [productId, productId]
    );

    // Get images for each comment
    for (const comment of comments) {
      const [images] = await db.query(
        'SELECT image_url FROM comment_images WHERE comment_id = ?',
        [comment.comment_id]
      );
      comment.images = images.map(img => img.image_url);
    }

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// Add product comment with rating
app.post('/api/products/:id/comments', verifyToken, upload.array('images', 5), async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.userId;
    const { comment, rating } = req.body;

    // Validate input
    if (!comment || !rating) {
      return res.status(400).json({ message: 'Comment and rating are required' });
    }

    // Start transaction
    await db.query('START TRANSACTION');

    // Insert or update rating
    await db.query(
      `INSERT INTO product_ratings (product_id, user_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = ?`,
      [productId, userId, rating, rating]
    );

    // Insert comment
    const [commentResult] = await db.query(
      `INSERT INTO product_comments (product_id, user_id, text)
       VALUES (?, ?, ?)`,
      [productId, userId, comment]
    );

    const commentId = commentResult.insertId;

    // Process uploaded images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.query(
          'INSERT INTO comment_images (comment_id, image_url) VALUES (?, ?)',
          [commentId, file.filename]
        );
      }
    }

    // Commit transaction
    await db.query('COMMIT');

    // Get the newly created comment with user details
    const [newComment] = await db.query(
      `SELECT 
        pc.comment_id,
        pc.text,
        pc.created_at,
        c.id as user_id,
        c.full_name,
        c.profile_picture
      FROM product_comments pc
      JOIN customers c ON pc.user_id = c.id
      WHERE pc.comment_id = ?`,
      [commentId]
    );

    // Get images for the new comment
    const [images] = await db.query(
      'SELECT image_url FROM comment_images WHERE comment_id = ?',
      [commentId]
    );

    const response = {
      ...newComment[0],
      images: images.map(img => img.image_url),
      rating: parseFloat(rating)
    };

    res.status(201).json(response);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});
// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`JWT Secret: ${JWT_SECRET.substring(0, 10)}... (only shown for debugging)`);
});


// Get all products with variants and images
