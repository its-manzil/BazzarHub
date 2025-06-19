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
    cb(null, path.join(__dirname, 'uploads'));
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
  password: "manjil@123",
  database: "BazarHub",
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

// Add this to your backend
app.get('/api/verify-token', verifyToken, (req, res) => {
  res.status(200).json({ valid: true });
});
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

// Product Management Routes
app.post('/api/products', upload.array('images', 5), async (req, res) => {
  try {
    const { productName, brand, category, description, variants } = req.body;
    
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
          'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
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

// Product Listing Routes
app.get('/api/products', async (req, res) => {
  try {
    const { category, sort, search } = req.query;

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

    const queryParams = [];
    if (category && category !== 'All') {
      query += ' AND p.category = ?';
      queryParams.push(category);
    }

    if (search) {
      query += ' AND (p.product_name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

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
        default:
          query += ' ORDER BY p.created_at DESC';
          break;
      }
    } else {
      query += ' ORDER BY p.created_at DESC';
    }

    const [products] = await db.query(query, queryParams);

    for (const product of products) {
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

      const [images] = await db.query(
        'SELECT image_id, image_url FROM product_images WHERE product_id = ?',
        [product.product_id]
      );
      product.images = images || [];

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
    }

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

app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;

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

    const [images] = await db.query(
      'SELECT image_id, image_url FROM product_images WHERE product_id = ? ORDER BY image_id',
      [productId]
    );
    product.images = images;

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

    const [similarProducts] = await db.query(
      `SELECT 
        p.product_id, 
        p.product_name,
        p.brand,
        (SELECT image_url FROM product_images WHERE product_id = p.product_id LIMIT 1) as main_image,
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

// Review Routes
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const productId = req.params.id;

    const [reviews] = await db.query(
      `SELECT 
        pr.rating_id,
        pr.rating,
        pr.created_at,
        pc.comment_id,
        pc.text,
        c.id as user_id,
        c.full_name,
        c.profile_picture,
        (SELECT AVG(rating) FROM product_ratings WHERE product_id = ?) as avg_rating
      FROM product_ratings pr
      LEFT JOIN product_comments pc ON pr.product_id = pc.product_id AND pr.user_id = pc.user_id
      JOIN customers c ON pr.user_id = c.id
      WHERE pr.product_id = ?
      ORDER BY pr.created_at DESC`,
      [productId, productId]
    );

    // Get images for each review
    for (const review of reviews) {
      if (review.comment_id) {
        const [images] = await db.query(
          'SELECT image_url FROM comment_images WHERE comment_id = ?',
          [review.comment_id]
        );
        review.images = images.map(img => img.image_url);
      } else {
        review.images = [];
      }
    }

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

app.post('/api/products/:id/reviews', verifyToken, upload.array('images', 5), async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.userId;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
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
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE text = ?`,
      [productId, userId, comment, comment]
    );

    const commentId = commentResult.insertId || (
      await db.query(
        'SELECT comment_id FROM product_comments WHERE product_id = ? AND user_id = ?',
        [productId, userId]
      )
    )[0][0].comment_id;

    // Process uploaded images
    if (req.files && req.files.length > 0) {
      // First delete existing images for this comment
      await db.query(
        'DELETE FROM comment_images WHERE comment_id = ?',
        [commentId]
      );

      // Then insert new images
      for (const file of req.files) {
        await db.query(
          'INSERT INTO comment_images (comment_id, image_url) VALUES (?, ?)',
          [commentId, file.filename]
        );
      }
    }

    // Commit transaction
    await db.query('COMMIT');

    // Get the newly created review with user details
    const [newReview] = await db.query(
      `SELECT 
        pr.rating_id,
        pr.rating,
        pr.created_at,
        pc.comment_id,
        pc.text,
        c.id as user_id,
        c.full_name,
        c.profile_picture
      FROM product_ratings pr
      LEFT JOIN product_comments pc ON pr.product_id = pc.product_id AND pr.user_id = pc.user_id
      JOIN customers c ON pr.user_id = c.id
      WHERE pr.product_id = ? AND pr.user_id = ?`,
      [productId, userId]
    );

    // Get images for the new review
    const [images] = await db.query(
      'SELECT image_url FROM comment_images WHERE comment_id = ?',
      [commentId]
    );

    const response = {
      ...newReview[0],
      images: images.map(img => img.image_url)
    };

    res.status(201).json(response);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Error adding review' });
  }
});

// Search Routes
app.get('/api/search', async (req, res) => {
  try {
    const { q, category } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Search query is required' 
      });
    }

    // Get all products for search
    const [allProducts] = await db.query(`
      SELECT 
        p.product_id, 
        p.product_name, 
        p.brand, 
        p.description,
        p.category,
        GROUP_CONCAT(DISTINCT pv.variant_name SEPARATOR ', ') as variant_names,
        (SELECT image_url FROM product_images WHERE product_id = p.product_id LIMIT 1) as image_url,
        MIN(pv.selling_price) as min_price,
        MAX(pv.marked_price) as max_price
      FROM products p
      JOIN product_variants pv ON p.product_id = pv.product_id
      GROUP BY p.product_id
    `);

    // Filter by category if provided
    let filteredProducts = allProducts;
    if (category) {
      filteredProducts = allProducts.filter(p => 
        p.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Perform search with typo tolerance
    const { results, suggestion } = searchProducts(filteredProducts, q);

    res.json({ 
      success: true,
      results: results.slice(0, 50),
      suggestion: suggestion
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error performing search' 
    });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT DISTINCT category FROM products WHERE category IS NOT NULL
    `);
    
    res.json({ 
      success: true,
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching categories' 
    });
  }
});

// Search helper functions
function searchProducts(products, query) {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
  const suggestionThreshold = 0.7;
  let bestSuggestion = null;
  let bestScore = 0;

  const scoredProducts = products.map(product => {
    const productName = product.product_name.toLowerCase();
    const brand = product.brand.toLowerCase();
    const category = product.category.toLowerCase();
    
    let exactMatchScore = 0;
    let partialMatchScore = 0;
    let typoToleranceScore = 0;
    
    queryTerms.forEach(term => {
      if (productName.includes(term)) exactMatchScore += 10;
      if (brand.includes(term)) exactMatchScore += 8;
      if (category.includes(term)) exactMatchScore += 5;
      
      if (productName.startsWith(term)) partialMatchScore += 5;
      if (brand.startsWith(term)) partialMatchScore += 4;
      
      if (exactMatchScore === 0 && partialMatchScore === 0) {
        const productWords = productName.split(/\s+/);
        
        for (const word of productWords) {
          const similarity = stringSimilarity(word, term);
          if (similarity > suggestionThreshold && similarity > bestScore) {
            bestScore = similarity;
            bestSuggestion = word;
          }
          if (similarity > 0.5) {
            typoToleranceScore += similarity * 3;
          }
        }
      }
    });
    
    return {
      ...product,
      _score: exactMatchScore + partialMatchScore * 0.7 + typoToleranceScore
    };
  });
  
  const sortedResults = scoredProducts.sort((a, b) => b._score - a._score);
  const filteredResults = sortedResults.filter(p => p._score > 0);
  
  return {
    results: filteredResults,
    suggestion: bestScore > suggestionThreshold ? bestSuggestion : null
  };
}

function stringSimilarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  
  if (longerLength === 0) return 1.0;
  
  return (longerLength - levenshteinDistance(longer, shorter)) / longerLength;
}

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i-1) === a.charAt(j-1)) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i-1][j-1] + 1,
          matrix[i][j-1] + 1,
          matrix[i-1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

//***---***---Cart section---***---***
// Cart Routes
// Add these endpoints to your server.js file:

// Create or get user's cart
app.post('/api/cart', verifyToken, async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const userId = req.userId;

    // Validate input
    if (!productId || !variantId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid cart item data' });
    }

    // Check if product and variant exist
    const [product] = await db.query('SELECT * FROM products WHERE product_id = ?', [productId]);
    const [variant] = await db.query(
      'SELECT * FROM product_variants WHERE variant_id = ? AND product_id = ?', 
      [variantId, productId]
    );

    if (!product.length || !variant.length) {
      return res.status(404).json({ message: 'Product or variant not found' });
    }

    // Check if variant is in stock
    if (variant[0].stock_quantity < quantity) {
      return res.status(400).json({ 
        message: `Only ${variant[0].stock_quantity} items available in stock` 
      });
    }

    // Get or create user's cart
    let [cart] = await db.query('SELECT * FROM carts WHERE user_id = ?', [userId]);
    
    if (!cart.length) {
      const [result] = await db.query(
        'INSERT INTO carts (user_id) VALUES (?)',
        [userId]
      );
      cart = [{ cart_id: result.insertId, user_id: userId }];
    }

    // Check if item already exists in cart
    const [existingItem] = await db.query(
      `SELECT * FROM cart_items 
       WHERE cart_id = ? AND product_id = ? AND variant_id = ?`,
      [cart[0].cart_id, productId, variantId]
    );

    if (existingItem.length) {
      // Update quantity if item exists
      const newQuantity = existingItem[0].quantity + quantity;
      await db.query(
        `UPDATE cart_items 
         SET quantity = ?, price = ?
         WHERE cart_item_id = ?`,
        [newQuantity, variant[0].selling_price, existingItem[0].cart_item_id]
      );
    } else {
      // Add new item to cart
      await db.query(
        `INSERT INTO cart_items 
         (cart_id, user_id, product_id, variant_id, quantity, price) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          cart[0].cart_id,
          userId,
          productId,
          variantId,
          quantity,
          variant[0].selling_price
        ]
      );
    }

    res.status(200).json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ message: 'Error adding item to cart' });
  }
});

// Get user's cart
app.get('/api/cart', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const [cart] = await db.query(
      `SELECT 
        ci.cart_item_id,
        ci.quantity,
        ci.price,
        p.product_id,
        p.product_name,
        pv.variant_id,
        pv.variant_name,
        pv.variant_value,
        pi.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      JOIN product_variants pv ON ci.variant_id = pv.variant_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.image_id = (
        SELECT MIN(image_id) FROM product_images 
        WHERE product_id = p.product_id
      )
      WHERE ci.user_id = ?`,
      [userId]
    );

    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Error retrieving cart' });
  }
});

// Remove product from cart
app.delete('/api/cart/:itemId', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const itemId = req.params.itemId;

    // First verify the item belongs to the user
    const [results] = await db.query(
      'SELECT 1 FROM cart_items WHERE cart_item_id = ? AND user_id = ?',
      [itemId, userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Cart item not found or not owned by user' });
    }

    await db.query(
      'DELETE FROM cart_items WHERE cart_item_id = ?',
      [itemId]
    );

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({ message: 'Error removing item from cart' });
  }
});

//Update products quantity in cart
app.put('/api/cart/:itemId', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const itemId = req.params.itemId;
    const { quantity } = req.body;

    if (!quantity || isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    // First verify the item belongs to the user
    const [results] = await db.query(
      'SELECT 1 FROM cart_items WHERE cart_item_id = ? AND user_id = ?',
      [itemId, userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Cart item not found or not owned by user' });
    }

    await db.query(
      'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
      [quantity, itemId]
    );

    res.json({ message: 'Quantity updated successfully' });
  } catch (error) {
    console.error('Update cart quantity error:', error);
    res.status(500).json({ message: 'Error updating cart quantity' });
  }
});
// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});