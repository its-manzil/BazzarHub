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

// Order Routes
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { items, shipping_address, payment_method, payment_details } = req.body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid order items' });
    }

    if (!shipping_address || !payment_method) {
      return res.status(400).json({ message: 'Shipping address and payment method are required' });
    }

    // Start transaction
    await db.query('START TRANSACTION');

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      const [variant] = await db.query(
        'SELECT selling_price FROM product_variants WHERE variant_id = ?',
        [item.variant_id]
      );
      
      if (!variant.length) {
        await db.query('ROLLBACK');
        return res.status(400).json({ message: `Variant ${item.variant_id} not found` });
      }

      totalAmount += variant[0].selling_price * item.quantity;
    }

    // Create order
    const [orderResult] = await db.query(
      `INSERT INTO orders 
       (user_id, total_amount, payment_method, shipping_address, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        totalAmount,
        payment_method,
        JSON.stringify(shipping_address),
        'Pending'
      ]
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const item of items) {
      // Get product and variant details
      const [product] = await db.query(
        `SELECT 
          p.product_name,
          pv.variant_name,
          pv.variant_value,
          pv.selling_price
        FROM products p
        JOIN product_variants pv ON p.product_id = pv.product_id
        WHERE pv.variant_id = ?`,
        [item.variant_id]
      );

      if (!product.length) {
        await db.query('ROLLBACK');
        return res.status(400).json({ message: `Product for variant ${item.variant_id} not found` });
      }

      await db.query(
        `INSERT INTO order_items
         (order_id, product_id, variant_id, product_name, variant_name, variant_value, quantity, unit_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.variant_id,
          product[0].product_name,
          product[0].variant_name,
          product[0].variant_value,
          item.quantity,
          product[0].selling_price
        ]
      );

      // Update stock
      await db.query(
        `UPDATE product_variants 
         SET stock_quantity = stock_quantity - ?
         WHERE variant_id = ?`,
        [item.quantity, item.variant_id]
      );

      // Remove from cart
      await db.query(
        `DELETE FROM cart_items 
         WHERE user_id = ? AND product_id = ? AND variant_id = ?`,
        [userId, item.product_id, item.variant_id]
      );
    }

    // Create payment record
    await db.query(
      `INSERT INTO payments
       (order_id, method, details, amount, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        orderId,
        payment_method,
        JSON.stringify(payment_details),
        totalAmount,
        payment_method === 'cash' ? 'pending' : 'completed'
      ]
    );

    // Commit transaction
    await db.query('COMMIT');

    // Generate invoice (you would implement this function)
    const invoiceUrl = await generateInvoice(orderId);

    res.status(201).json({
      order_id: orderId,
      total_amount: totalAmount,
      payment_method,
      invoice_url: invoiceUrl
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Order error:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Invoice generation (mock function - you would implement this)
async function generateInvoice(orderId) {
  // In a real implementation, you would use a PDF generation library
  // like pdfkit, puppeteer, or a dedicated service
  const invoiceName = `invoice_${orderId}.pdf`;
  const invoicePath = path.join(__dirname, 'uploads', invoiceName);
  
  // Mock implementation - just creates an empty file
  require('fs').writeFileSync(invoicePath, '');
  
  return invoiceName;
}

app.get('/api/orders/:orderId/invoice', verifyToken, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.userId;

    // Verify order belongs to user
    const [order] = await db.query(
      'SELECT 1 FROM orders WHERE order_id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: 'Order not found or not authorized' });
    }

    const invoicePath = path.join(__dirname, 'uploads', `invoice_${orderId}.pdf`);

    // Check if invoice exists
    if (!require('fs').existsSync(invoicePath)) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.download(invoicePath);

  } catch (error) {
    console.error('Invoice error:', error);
    res.status(500).json({ message: 'Error downloading invoice' });
  }
});


// Get user's orders
// Get user's orders
app.get('/api/orders/my-orders', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

        const [orders] = await db.query(
            `SELECT 
                o.order_id,
                o.total_amount,
                o.status,
                o.created_at,
                o.shipping_address,
                oi.order_item_id,
                oi.product_id,
                oi.product_name,
                oi.variant_name,
                oi.variant_value,
                oi.quantity,
                oi.unit_price,
                (SELECT image_url FROM product_images WHERE product_id = oi.product_id LIMIT 1) as image_url
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC`,
            [userId]
        );

        const ordersMap = {};
        orders.forEach(row => {
            if (!ordersMap[row.order_id]) {
                let shippingAddress = row.shipping_address;
                if (typeof shippingAddress === 'string') {
                    try {
                        shippingAddress = JSON.parse(shippingAddress);
                    } catch {
                        shippingAddress = {};
                    }
                }

                ordersMap[row.order_id] = {
                    order_id: row.order_id,
                    total_amount: Number(row.total_amount) || 0,
                    status: row.status,
                    created_at: row.created_at,
                    shipping_address: shippingAddress,
                    items: []
                };
            }
            ordersMap[row.order_id].items.push({
                order_item_id: row.order_item_id,
                product_id: row.product_id,
                product_name: row.product_name,
                variant_name: row.variant_name,
                variant_value: row.variant_value,
                quantity: row.quantity,
                unit_price: Number(row.unit_price) || 0,
                image_url: row.image_url
            });
        });

        res.json({ orders: Object.values(ordersMap) });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Get order details
app.get('/api/orders/:orderId', verifyToken, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const userId = req.userId;

        // Verify order belongs to user
        const [orderCheck] = await db.query(
            'SELECT 1 FROM orders WHERE order_id = ? AND user_id = ?',
            [orderId, userId]
        );

        if (orderCheck.length === 0) {
            return res.status(404).json({ message: 'Order not found or not authorized' });
        }

        // Get order details
        const [order] = await db.query(
            `SELECT 
                o.order_id,
                o.total_amount,
                o.status,
                o.created_at,
                o.shipping_address,
                o.payment_method
            FROM orders o
            WHERE o.order_id = ?`,
            [orderId]
        );

        if (order.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Get order items
        const [items] = await db.query(
            `SELECT 
                oi.order_item_id,
                oi.product_id,
                oi.product_name,
                oi.variant_name,
                oi.variant_value,
                oi.quantity,
                oi.unit_price,
                (SELECT image_url FROM product_images WHERE product_id = oi.product_id LIMIT 1) as image_url,
                (SELECT rating FROM product_ratings WHERE product_id = oi.product_id AND user_id = ?) as rating,
                (SELECT text FROM product_comments WHERE product_id = oi.product_id AND user_id = ?) as comment
            FROM order_items oi
            WHERE oi.order_id = ?`,
            [userId, userId, orderId]
        );

        // Add reviews to items if they exist
        const itemsWithReviews = items.map(item => {
            if (item.rating || item.comment) {
                return {
                    ...item,
                    review: {
                        rating: item.rating,
                        comment: item.comment
                    }
                };
            }
            return item;
        });

        res.json({
            order: {
                ...order[0],
                shipping_address: JSON.parse(order[0].shipping_address),
                items: itemsWithReviews
            }
        });
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({ message: 'Error fetching order details' });
    }
});

// Get order tracking history
app.get('/api/orders/:orderId/tracking', verifyToken, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const userId = req.userId;

        // Verify order belongs to user
        const [orderCheck] = await db.query(
            'SELECT 1 FROM orders WHERE order_id = ? AND user_id = ?',
            [orderId, userId]
        );

        if (orderCheck.length === 0) {
            return res.status(404).json({ message: 'Order not found or not authorized' });
        }

        // Get tracking history
        const [history] = await db.query(
            `SELECT 
                old_status,
                new_status,
                changed_by,
                notes,
                created_at
            FROM order_status_history
            WHERE order_id = ?
            ORDER BY created_at DESC`,
            [orderId]
        );

        res.json({ history });
    } catch (error) {
        console.error('Get tracking history error:', error);
        res.status(500).json({ message: 'Error fetching tracking history' });
    }
});

// Cancel order
// Cancel specific order item
app.put('/api/orders/:orderId/items/:itemId/cancel', verifyToken, async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const userId = req.userId;

        // Verify order belongs to user
        const [order] = await db.query(
            'SELECT status FROM orders WHERE order_id = ? AND user_id = ?',
            [orderId, userId]
        );

        if (order.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found or not authorized' 
            });
        }

        // Get the item to cancel
        const [item] = await db.query(
            'SELECT * FROM order_items WHERE order_item_id = ? AND order_id = ?',
            [itemId, orderId]
        );

        if (item.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Order item not found' 
            });
        }

        // Check if item can be cancelled
        if (item[0].status !== 'Pending' && item[0].status !== 'Processing') {
            return res.status(400).json({ 
                success: false,
                message: `Item cannot be cancelled in its current state (${item[0].status})`
            });
        }

        // Begin transaction
        await db.query('START TRANSACTION');

        try {
            // Update item status
            await db.query(
                'UPDATE order_items SET status = ? WHERE order_item_id = ?',
                ['Cancelled', itemId]
            );

            // Record status change
            await db.query(
                `INSERT INTO order_status_history 
                (order_id, old_status, new_status, changed_by, notes, item_id)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    orderId,
                    item[0].status,
                    'Cancelled',
                    'customer',
                    `Item ${itemId} cancelled by customer`,
                    itemId
                ]
            );

            // Check if all items are cancelled to update order status
            const [remainingItems] = await db.query(
                `SELECT COUNT(*) as count 
                FROM order_items 
                WHERE order_id = ? 
                AND status NOT IN ('Cancelled', 'Returned')`,
                [orderId]
            );

            if (remainingItems[0].count === 0) {
                await db.query(
                    'UPDATE orders SET status = ? WHERE order_id = ?',
                    ['Cancelled', orderId]
                );
                
                // Record order status change
                await db.query(
                    `INSERT INTO order_status_history 
                    (order_id, old_status, new_status, changed_by, notes, item_id)
                    VALUES (?, ?, ?, ?, ?, NULL)`,
                    [
                        orderId,
                        order[0].status,
                        'Cancelled',
                        'system',
                        'All items cancelled - order automatically cancelled',
                    ]
                );
            }

            await db.query('COMMIT');
            res.json({ 
                success: true,
                message: 'Item cancelled successfully',
                data: {
                    order_id: orderId,
                    item_id: itemId,
                    new_status: 'Cancelled'
                }
            });
        } catch (err) {
            await db.query('ROLLBACK');
            console.error('Database error:', err);
            throw new Error('Failed to update order status in database');
        }
    } catch (error) {
        console.error('Cancel item error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error cancelling item',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Add this to your server.js
// Add this to your server.js (remove verifyToken middleware)
app.get('/api/customers', async (req, res) => {
  try {
    const [customers] = await db.query(`
      SELECT 
        c.id,
        c.username,
        c.email,
        c.phone,
        c.full_name,
        c.profile_picture,
        c.created_at,
        COUNT(DISTINCT o.order_id) AS total_orders,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0.00) AS total_spent
      FROM customers c
      LEFT JOIN orders o ON c.id = o.user_id AND o.status != 'Cancelled'
      LEFT JOIN order_items oi ON o.order_id = oi.order_id AND oi.status != 'Cancelled'
      GROUP BY c.id
      ORDER BY total_spent DESC
    `);

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
});

// Get all products with variants
app.get('/api/allProducts', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    
    for (let product of products) {
      const [variants] = await db.query(
        'SELECT * FROM product_variants WHERE product_id = ?',
        [product.product_id]
      );
      product.variants = variants;
    }
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Update variant stock
app.put('/api/variants/:variantId/stock', async (req, res) => {
  try {
    const { variantId } = req.params;
    const { stock_quantity } = req.body;
    
    await db.query(
      'UPDATE product_variants SET stock_quantity = ? WHERE variant_id = ?',
      [stock_quantity, variantId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Error updating stock' });
  }
});

// Add new variant
app.post('/api/allProducts/:productId/variants', async (req, res) => {
  try {
    const { productId } = req.params;
    const { variant_name, variant_value, marked_price, selling_price, stock_quantity } = req.body;
    
    if (parseFloat(selling_price) > parseFloat(marked_price)) {
      return res.status(400).json({ message: 'Selling price must be ≤ marked price' });
    }
    
    const [result] = await db.query(
      `INSERT INTO product_variants 
      (product_id, variant_name, variant_value, marked_price, selling_price, stock_quantity) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [productId, variant_name, variant_value, marked_price, selling_price, stock_quantity]
    );
    
    const [newVariant] = await db.query(
      'SELECT * FROM product_variants WHERE variant_id = ?',
      [result.insertId]
    );
    
    res.json(newVariant[0]);
  } catch (error) {
    console.error('Error adding variant:', error);
    res.status(500).json({ message: 'Error adding variant' });
  }
});

// Get all orders with details
// Get all orders with details
app.get('/api/allOrders', async (req, res) => {
  try {
    // Get all orders with user details
    const [orders] = await db.query(`
      SELECT o.*, 
             c.full_name, c.email, c.phone,
             p.status as payment_status
      FROM orders o
      LEFT JOIN customers c ON o.user_id = c.id
      LEFT JOIN payments p ON o.order_id = p.order_id
      ORDER BY o.created_at DESC
    `);

    // Get order items for each order
    for (let order of orders) {
      const [items] = await db.query(`
        SELECT * FROM order_items 
        WHERE order_id = ?
      `, [order.order_id]);
      order.items = items;
      
      // Add user details object
      order.user_details = {
        full_name: order.full_name,
        email: order.email,
        phone: order.phone
      };

      // Ensure total_amount is a number
      order.total_amount = Number(order.total_amount);
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Update order status
app.put('/api/allOrders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Update order status
    await db.query(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      [status, orderId]
    );
    
    // Record in history
    await db.query(
      `INSERT INTO order_status_history 
      (order_id, old_status, new_status, changed_by, notes)
      SELECT order_id, status, ?, 'admin', 'Status changed via admin panel'
      FROM orders WHERE order_id = ?`,
      [status, orderId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Chatbot endpoint
// Chatbot endpoint with concise responses
app.post('/api/chatbot', async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;
    
    // Get product data from database
    const [products] = await db.query(`
      SELECT p.product_name, p.category, p.description, 
             v.variant_name, v.variant_value, v.selling_price, v.stock_quantity
      FROM products p
      JOIN product_variants v ON p.product_id = v.product_id
      WHERE v.stock_quantity > 0
      ORDER BY p.category, p.product_name
    `);

    // Format products for the prompt
    const productList = products.map(p => ({
      name: p.product_name,
      category: p.category,
      variant: `${p.variant_name}: ${p.variant_value}`,
      price: p.selling_price,
      stock: p.stock_quantity,
      description: p.description
    }));

    // Create prompt with context
    const prompt = `
      You are a helpful shopping assistant for BazarHub. Keep responses very short and concise (1-3 sentences max).
      Always display prices in Nepalese Rupees (Rs.) format.
      
      Current product inventory:
      ${JSON.stringify(productList, null, 2)}
      
      Chat history:
      ${JSON.stringify(chatHistory, null, 2)}
      
      User message: "${message}"
      
      Respond concisely:
      1. Answer directly without lengthy explanations
      2. Suggest specific products when asked
      3. Mention prices in Rs. only
      4. Don't list all categories unless asked
      5. Keep it friendly but very brief
    `;

    // Call Ollama API
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llama3",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 100 // Limit response length
        }
      })
    });

    const ollamaData = await ollamaResponse.json();
    
    res.json({
      response: ollamaData.response,
      products: productList
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Error processing chatbot request' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});