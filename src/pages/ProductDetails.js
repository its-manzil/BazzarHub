import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Button, Typography, IconButton,
  Snackbar, Alert, CircularProgress, Divider, Rating
} from '@mui/material';
import {
  ShoppingCart, Favorite, Share, 
  ArrowBack, ArrowForward, ZoomIn
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
        const response = await axios.get(`http://localhost:8099/api/storeProducts/${id}`);
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
            if (variant.stock_quantity > 0) {
              initialVariants[variant.variant_id] = false;
              initialQuantities[variant.variant_id] = 1;
            }
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

  const handleNextImage = () => {
    setActiveImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
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

  const handleAddToWishlist = () => {
    if (!isLoggedIn) {
      setSnackbar({
        open: true,
        message: 'Please login to add items to wishlist',
        severity: 'error'
      });
      navigate('/login');
      return;
    }

    setWishlisted(!wishlisted);
    setSnackbar({
      open: true,
      message: wishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      severity: 'success'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.product_name,
        text: `Check out this ${product.product_name} on our store!`,
        url: window.location.href,
      })
      .catch(() => {
        navigator.clipboard.writeText(window.location.href);
        setSnackbar({
          open: true,
          message: 'Link copied to clipboard!',
          severity: 'success'
        });
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSnackbar({
        open: true,
        message: 'Link copied to clipboard!',
        severity: 'success'
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
          <div className="product-images">
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

            <div className="main-image-container">
              {product.images?.length > 0 ? (
                <>
                  <div className="main-image-wrapper">
                    <img
                      src={getMainImageUrl(product.images[activeImageIndex]?.image_url)}
                      alt={product.product_name}
                      className="main-image"
                    />
                    {product.images.length > 1 && (
                      <>
                        <button className="nav-button prev" onClick={handlePrevImage}>
                          <ArrowBack />
                        </button>
                        <button className="nav-button next" onClick={handleNextImage}>
                          <ArrowForward />
                        </button>
                      </>
                    )}
                    <button 
                      className="zoom-button"
                      onClick={() => window.open(getMainImageUrl(product.images[activeImageIndex]?.image_url), '_blank')}
                    >
                      <ZoomIn />
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-image">
                  <Typography variant="body1">No Image Available</Typography>
                </div>
              )}
            </div>
          </div>

          <div className="product-info">
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
                <Typography variant="subtitle1" className="section-title">
                  Variants:
                </Typography>
                <div className="variants-grid">
                  {product.variants.map((variant) => (
                    <div 
                      key={variant.variant_id}
                      className={`variant-card ${variant.stock_quantity <= 0 ? 'disabled' : ''} ${selectedVariants[variant.variant_id] ? 'selected' : ''}`}
                    >
                      <div className="variant-content">
                        <Typography className="variant-name">
                          {variant.variant_name}: {variant.variant_value}
                        </Typography>
                        <Typography className="variant-price">
                          ${variant.selling_price.toFixed(2)}
                        </Typography>
                        <Typography className={`stock-status ${variant.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {variant.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </Typography>
                      </div>
                      
                      {variant.stock_quantity > 0 && (
                        <div className="variant-checkbox">
                          <input
                            type="checkbox"
                            id={`variant-${variant.variant_id}`}
                            checked={selectedVariants[variant.variant_id] || false}
                            onChange={() => toggleVariantSelection(variant.variant_id)}
                            disabled={variant.stock_quantity <= 0}
                          />
                          <label htmlFor={`variant-${variant.variant_id}`}>Select</label>
                        </div>
                      )}
                      
                      <div className="variant-quantity">
                        <button 
                          className="quantity-btn minus"
                          onClick={() => handleQuantityChange(variant.variant_id, (quantities[variant.variant_id] || 1) - 1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={quantities[variant.variant_id] || 1}
                          onChange={(e) => handleQuantityChange(variant.variant_id, e.target.value)}
                          min="1"
                          max={variant.stock_quantity}
                          className="quantity-input"
                        />
                        <button 
                          className="quantity-btn plus"
                          onClick={() => handleQuantityChange(variant.variant_id, (quantities[variant.variant_id] || 1) + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="action-buttons">
              <div className="add-to-cart-container">
                <Button
                  variant="contained"
                  color="primary"
                  className="add-to-cart-btn"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
                <div className="total-price">
                  Total: ${calculateTotalPrice().toFixed(2)}
                </div>
              </div>
              
              <div className="secondary-actions">
                <IconButton
                  color={wishlisted ? 'error' : 'default'}
                  onClick={handleAddToWishlist}
                  className="wishlist-btn"
                >
                  <Favorite />
                </IconButton>
                
                <IconButton
                  onClick={handleShare}
                  className="share-btn"
                >
                  <Share />
                </IconButton>
              </div>
            </div>
          </div>
        </div>

        <div className="product-tabs">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${tabValue === 0 ? 'active' : ''}`}
              onClick={() => setTabValue(0)}
            >
              Description
            </button>
            <button 
              className={`tab-btn ${tabValue === 1 ? 'active' : ''}`}
              onClick={() => setTabValue(1)}
            >
              Specifications
            </button>
            <button 
              className={`tab-btn ${tabValue === 2 ? 'active' : ''}`}
              onClick={() => setTabValue(2)}
            >
              Reviews ({comments.length})
            </button>
          </div>
          
          <div className="tab-content">
            {tabValue === 0 && (
              <Typography variant="body1" className="description">
                {product.description || 'No description available.'}
              </Typography>
            )}
            
            {tabValue === 1 && (
              <div className="specifications">
                <Typography variant="h6" className="section-title">Product Specifications</Typography>
                <div className="specs-grid">
                  {product.variants?.map((variant) => (
                    <React.Fragment key={variant.variant_id}>
                      <div className="spec-name">{variant.variant_name}:</div>
                      <div className="spec-value">{variant.variant_value}</div>
                    </React.Fragment>
                  ))}
                  <div className="spec-name">SKU:</div>
                  <div className="spec-value">{product.variants?.[0]?.sku || 'N/A'}</div>
                </div>
              </div>
            )}
            
            {tabValue === 2 && (
              <div className="reviews-section">
                {/* Reviews content would go here */}
              </div>
            )}
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        className="snackbar"
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          className="alert"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductDetails;