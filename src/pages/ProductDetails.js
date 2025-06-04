import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Button, Typography, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Checkbox, TextField, Snackbar, Alert,
  CircularProgress, Divider, Rating, Tabs, Tab, Box
} from '@mui/material';
import {
  ShoppingCart, Favorite, Share, ArrowBack, ZoomIn
} from '@mui/icons-material';
import Nav from './Nav';
import Search from './Search';
import Logo from './Logo';
import CartLogo from './CartLogo';
import './productDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantities, setQuantities] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [comments, setComments] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8099/api/Products/${id}`);
        const productData = response.data;
        
        if (productData.variants) {
          productData.variants = productData.variants.map(variant => ({
            ...variant,
            selling_price: Number(variant.selling_price),
            marked_price: Number(variant.marked_price)
          }));
          
          const initialVariants = {};
          const initialQuantities = {};
          
          productData.variants.forEach(variant => {
            initialVariants[variant.variant_id] = false;
            initialQuantities[variant.variant_id] = 1;
          });
          
          setSelectedVariants(initialVariants);
          setQuantities(initialQuantities);
        }
        
        setProduct(productData);
        
        try {
          const commentsResponse = await axios.get(`http://localhost:8099/api/products/${id}/comments`);
          setComments(commentsResponse.data);
        } catch (commentsError) {
          console.error('Error fetching comments:', commentsError);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleImageClick = (index) => {
    setActiveImageIndex(index);
  };

  const toggleVariantSelection = (variantId) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantId]: !prev[variantId]
    }));
    
    if (!quantities[variantId]) {
      setQuantities(prev => ({
        ...prev,
        [variantId]: 1
      }));
    }
  };

  const handleQuantityChange = (variantId, value) => {
    const variant = product.variants.find(v => v.variant_id === variantId);
    const newValue = Math.max(1, Math.min(variant.stock_quantity, parseInt(value) || 1));
    
    setQuantities(prev => ({
      ...prev,
      [variantId]: newValue
    }));
  };

  const calculateTotalPrice = () => {
    return product.variants.reduce((total, variant) => {
      if (selectedVariants[variant.variant_id]) {
        return total + (variant.selling_price * (quantities[variant.variant_id] || 1));
      }
      return total;
    }, 0);
  };

  const handleAddToCart = async () => {
    const selectedVariantIds = Object.keys(selectedVariants).filter(id => selectedVariants[id]);
    
    if (selectedVariantIds.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one variant',
        severity: 'error'
      });
      return;
    }

    if (!isLoggedIn) {
      setSnackbar({
        open: true,
        message: 'Please login to add items to cart',
        severity: 'error'
      });
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const requests = selectedVariantIds.map(variantId => 
        axios.post('http://localhost:8099/api/cart', {
          productId: id,
          variantId,
          quantity: quantities[variantId] || 1
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      await Promise.all(requests);

      setSnackbar({
        open: true,
        message: 'Products added to cart successfully!',
        severity: 'success'
      });
      
      navigate("/Cart");
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to add to cart',
        severity: 'error'
      });
    }
  };

  const handleAddReview = async () => {
    if (!isLoggedIn) {
      setSnackbar({
        open: true,
        message: 'Please login to submit a review',
        severity: 'error'
      });
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8099/api/products/${id}/comments`, {
        comment: reviewText,
        rating: reviewRating
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const commentsResponse = await axios.get(`http://localhost:8099/api/products/${id}/comments`);
      setComments(commentsResponse.data);
      
      setReviewText('');
      setReviewRating(0);
      
      setSnackbar({
        open: true,
        message: 'Review submitted successfully!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to submit review',
        severity: 'error'
      });
    }
  };

  const getMainImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:8099/uploads/${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Typography variant="h6" className="error-message">
          Error loading product: {error}
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)} className="back-button">
          Go Back
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found-container">
        <Typography variant="h6">Product not found</Typography>
        <Button variant="contained" onClick={() => navigate('/')} className="shopping-button">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <>
      <Search />
      <Nav />
      <Logo />
      <CartLogo />
      
      <div className="product-details-container">
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
          className="back-button"
        >
          Back to Store
        </Button>

        <div className="product-content">
          {/* Image Section (40%) */}
          <div className="product-images-section">
            <div className="main-image-container">
              {product.images?.length > 0 ? (
                <>
                  <img
                    src={getMainImageUrl(product.images[activeImageIndex]?.image_url)}
                    alt={product.product_name}
                    className="main-image"
                  />
                  <button 
                    className="zoom-button"
                    onClick={() => window.open(getMainImageUrl(product.images[activeImageIndex]?.image_url), '_blank')}
                  >
                    <ZoomIn />
                  </button>
                </>
              ) : (
                <div className="no-image">
                  <Typography variant="body1">No Image Available</Typography>
                </div>
              )}
            </div>
            
            <div className="thumbnail-container">
              {product.images?.map((image, index) => (
                <div
                  key={image.image_id}
                  onClick={() => handleImageClick(index)}
                  className={`thumbnail ${activeImageIndex === index ? 'active' : ''}`}
                >
                  <img
                    src={getMainImageUrl(image.image_url)}
                    alt={`${product.product_name} thumbnail ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info Section (60%) */}
          <div className="product-info-section">
            <Typography variant="h4" className="product-title">
              {product.product_name}
            </Typography>
            
            <div className="rating-container">
              <Rating 
                value={product.rating || 0} 
                precision={0.5} 
                readOnly 
                className="rating-stars"
              />
              <Typography variant="body2" className="review-count">
                ({product.reviewCount || 0} reviews)
              </Typography>
              <span className="category-chip">
                {product.category || 'Uncategorized'}
              </span>
            </div>
            
            <Typography variant="subtitle1" className="brand">
              Brand: {product.brand}
            </Typography>
            
            <Divider className="divider" />
            
            {product.variants?.length > 0 && (
              <div className="variants-section">
                <Typography variant="h6" className="section-title">
                  Available Variants
                </Typography>
                
                <TableContainer component={Paper} className="variants-table">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Select</TableCell>
                        <TableCell>Variant</TableCell>
                        <TableCell>MP (Rs.)</TableCell>
                        <TableCell>SP (Rs.)</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Price (Rs.)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {product.variants.map((variant) => (
                        <TableRow 
                          key={variant.variant_id}
                          className={variant.stock_quantity <= 0 ? 'out-of-stock' : ''}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedVariants[variant.variant_id] || false}
                              onChange={() => toggleVariantSelection(variant.variant_id)}
                              disabled={variant.stock_quantity <= 0}
                            />
                          </TableCell>
                          <TableCell>
                            {variant.variant_name}: {variant.variant_value}
                          </TableCell>
                          <TableCell>{variant.marked_price.toFixed(2)}</TableCell>
                          <TableCell>{variant.selling_price.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={variant.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}>
                              {variant.stock_quantity > 0 ? variant.stock_quantity : 'Out of Stock'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={quantities[variant.variant_id] || 1}
                              onChange={(e) => handleQuantityChange(variant.variant_id, e.target.value)}
                              size="small"
                              inputProps={{
                                min: 1,
                                max: variant.stock_quantity
                              }}
                              disabled={!selectedVariants[variant.variant_id] || variant.stock_quantity <= 0}
                            />
                          </TableCell>
                          <TableCell>
                            {selectedVariants[variant.variant_id] ? 
                              (variant.selling_price * (quantities[variant.variant_id] || 1)).toFixed(2) : 
                              '0.00'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <div className="total-price-section">
                  <Typography variant="h6">
                    Total Amount: Rs.{calculateTotalPrice().toFixed(2)}
                  </Typography>
                </div>
              </div>
            )}
            
            <div className="action-buttons">
              <Button
                variant="contained"
                color="primary"
                className="add-to-cart-btn"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                fullWidth
                size="large"
              >
                Add to Cart
              </Button>
              
              <div className="secondary-actions">
                <IconButton
                  color={wishlisted ? 'error' : 'default'}
                  onClick={() => setWishlisted(!wishlisted)}
                  className="wishlist-btn"
                >
                  <Favorite />
                </IconButton>
                
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setSnackbar({
                      open: true,
                      message: 'Link copied to clipboard!',
                      severity: 'success'
                    });
                  }}
                  className="share-btn"
                >
                  <Share />
                </IconButton>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs Section */}
        <div className="product-tabs-section">
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
          >
            <Tab label="Description" />
            <Tab label="Specifications" />
            <Tab label={`Reviews (${comments.length})`} />
          </Tabs>
          
          <Box className="tab-content" p={3}>
            {tabValue === 0 && (
              <Typography variant="body1" className="description">
                {product.description || 'No description available.'}
              </Typography>
            )}
            
            {tabValue === 1 && (
              <div className="specifications">
                <Typography variant="h6" className="section-title">Product Specifications</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      {product.variants?.map((variant) => (
                        <TableRow key={variant.variant_id}>
                          <TableCell component="th" scope="row">
                            {variant.variant_name}
                          </TableCell>
                          <TableCell>{variant.variant_value}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell component="th" scope="row">SKU</TableCell>
                        <TableCell>{product.variants?.[0]?.sku || 'N/A'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}
            
            {tabValue === 2 && (
              <div className="reviews-section">
                {comments.map((comment) => (
                  <div key={comment.comment_id} className="review-item">
                    <div className="review-header">
                      <Typography variant="subtitle1" className="review-author">
                        {comment.full_name}
                      </Typography>
                      <Rating value={comment.avg_rating || 0} readOnly precision={0.5} />
                      <Typography variant="caption" className="review-date">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </Typography>
                    </div>
                    <Typography variant="body1" className="review-text">
                      {comment.text}
                    </Typography>
                    {comment.images?.length > 0 && (
                      <div className="review-images">
                        {comment.images.map((img, idx) => (
                          <img 
                            key={idx} 
                            src={getMainImageUrl(img)} 
                            alt={`Review ${idx + 1}`} 
                            className="review-image"
                          />
                        ))}
                      </div>
                    )}
                    <Divider className="review-divider" />
                  </div>
                ))}
                
                {isLoggedIn && (
                  <div className="add-review-section">
                    <Typography variant="h6">Add Your Review</Typography>
                    <Rating
                      value={reviewRating}
                      onChange={(e, newValue) => setReviewRating(newValue)}
                      precision={0.5}
                    />
                    <TextField
                      multiline
                      rows={4}
                      variant="outlined"
                      fullWidth
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your thoughts about this product..."
                      className="review-textfield"
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddReview}
                      disabled={!reviewText || reviewRating === 0}
                      className="submit-review-btn"
                    >
                      Submit Review
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Box>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <br/><br/><br/><br/><br/><br/>
    </>
  );
};

export default ProductDetails;