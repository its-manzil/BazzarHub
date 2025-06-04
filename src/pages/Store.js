import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import Search from './Search';
import Logo from './Logo';
import CartLogo from './CartLogo';
import {
  Box, Grid, Card, CardContent, Typography,
  Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Rating, Divider, Chip, IconButton
} from '@mui/material';
import { Favorite, Share } from '@mui/icons-material';
import axios from 'axios';
import './store.css';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [sortOption, setSortOption] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  const categories = [
    'All',
    'Clothing',
    'Electronics',
    'Sports',
    'Jewelry',
    'Medicines',
    'Home & Kitchen',
    'Beauty',
    'Books',
    'Toys',
    'Automotive'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8099/api/Products');
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }

    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'priceHigh':
        result.sort((a, b) => {
          const maxPriceA = Math.max(...a.variants.map(v => Number(v.selling_price)));
          const maxPriceB = Math.max(...b.variants.map(v => Number(v.selling_price)));
          return maxPriceB - maxPriceA;
        });
        break;
      case 'priceLow':
        result.sort((a, b) => {
          const minPriceA = Math.min(...a.variants.map(v => Number(v.selling_price)));
          const minPriceB = Math.min(...b.variants.map(v => Number(v.selling_price)));
          return minPriceA - minPriceB;
        });
        break;
      case 'alphabetical':
        result.sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [products, sortOption, selectedCategory]);

  const getMainImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:8099/uploads/${imageUrl}`;
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setSelectedImages(product.images);
    setSelectedVariants(product.variants.map(v => ({ 
      ...v, 
      selling_price: Number(v.selling_price),
      marked_price: Number(v.marked_price),
      quantity: v.stock_quantity > 0 ? 1 : 0 
    })));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVariants([]);
    setSelectedImages([]);
  };

  const handleVariantQuantityChange = (variantId, quantity) => {
    setSelectedVariants(prev => 
      prev.map(v => 
        v.variant_id === variantId ? { ...v, quantity } : v
      )
    );
  };

  const handleImageSelect = (index) => {
    const newImages = [...selectedImages];
    const selectedImage = newImages.splice(index, 1)[0];
    newImages.unshift(selectedImage);
    setSelectedImages(newImages);
  };

  const handleAddToCartConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const variantsToAdd = selectedVariants.filter(v => v.quantity > 0);
      
      if (variantsToAdd.length === 0) {
        alert('Please select at least one variant');
        return;
      }

      await Promise.all(
        variantsToAdd.map(variant => 
          axios.post('http://localhost:8099/api/cart', {
            productId: selectedProduct.product_id,
            variantId: variant.variant_id,
            quantity: variant.quantity
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );

      alert('Items added to cart successfully!');
      handleCloseDialog();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const toggleWishlist = (productId, e) => {
    e.stopPropagation();
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const shareProduct = (product, e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.product_name,
        text: `Check out this ${product.product_name} on our store!`,
        url: `${window.location.origin}/product/${product.product_id}`,
      }).catch(() => {
        navigator.clipboard.writeText(`${window.location.origin}/product/${product.product_id}`);
        alert('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/product/${product.product_id}`);
      alert('Link copied to clipboard!');
    }
  };

  const getPriceRange = (product) => {
    if (!product.variants || product.variants.length === 0) return 'N/A';
    const prices = product.variants.map(v => Number(v.selling_price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `Rs.${min.toFixed(2)}` : `Rs.${min.toFixed(2)} - Rs.${max.toFixed(2)}`;
  };

  return (
    <>
      <Search />
      <Nav />
      <Logo />
      <CartLogo />
      
      <Box className="storejs-container">
        <Box className="storejs-filter-controls">
          <FormControl className="storejs-sort-control">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortOption}
              label="Sort By"
              onChange={(e) => setSortOption(e.target.value)}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="priceHigh">Price: High to Low</MenuItem>
              <MenuItem value="priceLow">Price: Low to High</MenuItem>
              <MenuItem value="alphabetical">Alphabetical</MenuItem>
            </Select>
          </FormControl>

          <FormControl className="storejs-category-control">
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3} className="storejs-product-grid">
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.product_id}>
              <Card 
                className="storejs-product-card"
                onClick={() => handleProductClick(product.product_id)}
              >
                <Box className="storejs-product-image-container">
                  <img
                    src={getMainImageUrl(product.images[0]?.image_url)}
                    alt={product.product_name}
                    className="storejs-product-image"
                  />
                  <Box className="storejs-product-actions">
                    <IconButton
                      className={`storejs-action-button ${wishlist.includes(product.product_id) ? 'storejs-wishlisted' : ''}`}
                      onClick={(e) => toggleWishlist(product.product_id, e)}
                      size="small"
                    >
                      <Favorite />
                    </IconButton>
                    <IconButton
                      className="storejs-action-button"
                      onClick={(e) => shareProduct(product, e)}
                      size="small"
                    >
                      <Share />
                    </IconButton>
                  </Box>
                </Box>
                
                <CardContent className="storejs-product-info">
                  <Typography className="storejs-product-title">{product.product_name}</Typography>
                  <Typography className="storejs-product-brand">{product.brand}</Typography>
                  <Box className="storejs-product-rating">
                    <Rating
                      value={product.rating || 0}
                      precision={0.5}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" className="storejs-review-count">
                      ({product.reviewCount || 0})
                    </Typography>
                  </Box>
                  <Typography className="storejs-product-price">
                    {getPriceRange(product)}
                  </Typography>
                  <Chip
                    label={product.category || 'Uncategorized'}
                    size="small"
                    className="storejs-product-category"
                  />
                </CardContent>
                <Box className="storejs-product-button-container">
                  <Button
                    fullWidth
                    variant="contained"
                    className="storejs-add-to-cart-button"
                    onClick={(e) => handleAddToCart(product, e)}
                  >
                    Add to Cart
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="lg"
          fullWidth
          className="storejs-cart-dialog"
        >
          <DialogTitle>Add to Cart</DialogTitle>
          <DialogContent dividers className="storejs-dialog-content">
            {selectedProduct && (
              <Box className="storejs-dialog-container">
                <Box className="storejs-dialog-images-section">
                  <Box className="storejs-main-image-container">
                    {selectedImages.length > 0 ? (
                      <img
                        src={getMainImageUrl(selectedImages[0]?.image_url)}
                        alt={selectedProduct.product_name}
                        className="storejs-main-product-image"
                      />
                    ) : (
                      <Box className="storejs-no-image-placeholder">
                        <Typography>No Image Available</Typography>
                      </Box>
                    )}
                  </Box>
                  {selectedImages.length > 1 && (
                    <Box className="storejs-thumbnail-container">
                      {selectedImages.map((image, index) => (
                        <img
                          key={image.image_id || index}
                          src={getMainImageUrl(image.image_url)}
                          alt={`Thumbnail ${index + 1}`}
                          className={`storejs-thumbnail-image ${index === 0 ? 'storejs-selected-thumbnail' : ''}`}
                          onClick={() => handleImageSelect(index)}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                <Box className="storejs-dialog-details-section">
                  <Typography variant="h5">{selectedProduct.product_name}</Typography>
                  <Typography variant="subtitle1" className="storejs-product-brand">
                    {selectedProduct.brand}
                  </Typography>
                  <Chip
                    label={selectedProduct.category || 'Uncategorized'}
                    size="small"
                    className="storejs-product-category"
                  />
                  <Typography variant="body1" className="storejs-product-description">
                    {selectedProduct.description || 'No description available.'}
                  </Typography>
                  <Divider className="storejs-details-divider" />

                  <Typography variant="h6" className="storejs-variants-title">
                    Available Variants
                  </Typography>
                  {selectedVariants.map((variant) => (
                    <Box key={variant.variant_id} className="storejs-variant-item">
                      <Typography variant="subtitle1">
                        {variant.variant_name}: {variant.variant_value}
                      </Typography>
                      <Box className="storejs-variant-price-container">
                        <Typography variant="body1" className="storejs-variant-price">
                          Price: ${Number(variant.selling_price).toFixed(2)}
                          {variant.marked_price > variant.selling_price && (
                            <Typography component="span" className="storejs-marked-price">
                              ${Number(variant.marked_price).toFixed(2)}
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="body2" className={`storejs-stock-status ${variant.stock_quantity > 0 ? 'storejs-in-stock' : 'storejs-out-of-stock'}`}>
                          {variant.stock_quantity > 0 
                            ? `In Stock (${variant.stock_quantity})` 
                            : 'Out of Stock'}
                        </Typography>
                      </Box>
                      {variant.stock_quantity > 0 && (
                        <Box className="storejs-quantity-control">
                          <Typography>Quantity:</Typography>
                          <TextField
                            type="number"
                            value={variant.quantity}
                            onChange={(e) => {
                              const value = Math.max(0, Math.min(variant.stock_quantity, parseInt(e.target.value) || 0));
                              handleVariantQuantityChange(variant.variant_id, value);
                            }}
                            inputProps={{ 
                              min: 0, 
                              max: variant.stock_quantity 
                            }}
                            className="storejs-quantity-input"
                            size="small"
                          />
                          <Typography variant="caption" className="storejs-max-quantity">
                            Max: {variant.stock_quantity}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions className="storejs-dialog-actions">
            <Button onClick={handleCloseDialog} className="storejs-cancel-button">Cancel</Button>
            <Button 
              onClick={handleAddToCartConfirm} 
              variant="contained" 
              className="storejs-confirm-button"
              disabled={!selectedVariants.some(v => v.quantity > 0)}
            >
              Add to Cart
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Store;