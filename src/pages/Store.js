import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './/Nav';
import Search from './/Search'
import Logo from './/Logo'
import CartLogo from './/CartLogo'
import {
  Box, Grid, Card, CardMedia, CardContent, Typography,
  Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Rating, Divider, Chip,
} from '@mui/material';
import axios from 'axios';
import './store.css';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);
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
  // Modify the getMainImage function in Store.js


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8099/api/storeProducts');
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

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Sort products
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'priceHigh':
        result.sort((a, b) => {
          const maxPriceA = Math.max(...a.variants.map(v => v.selling_price));
          const maxPriceB = Math.max(...b.variants.map(v => v.selling_price));
          return maxPriceB - maxPriceA;
        });
        break;
      case 'priceLow':
        result.sort((a, b) => {
          const minPriceA = Math.min(...a.variants.map(v => v.selling_price));
          const minPriceB = Math.min(...b.variants.map(v => v.selling_price));
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

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    if (product.variants.length === 1) {
      setSelectedVariant(product.variants[0].variant_id);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVariant('');
    setQuantity(1);
  };

  const handleAddToCartConfirm = () => {
    if (!selectedVariant && selectedProduct.variants.length > 0) {
      alert('Please select a variant');
      return;
    }

    // Here you would typically add to cart via API
    console.log('Adding to cart:', {
      productId: selectedProduct.product_id,
      variantId: selectedVariant,
      quantity
    });

    // For now, just show an alert
    alert(`${quantity} ${selectedProduct.product_name} added to cart!`);
    handleCloseDialog();
  };

  // Modify the getMainImage function in Store.js
const getMainImage = (product) => {
  if (!product.images || product.images.length === 0) {
    return '/placeholder-product.jpg'; // Default placeholder image
  }
  
  // Check if image_url is already a full URL
  if (product.images[0].image_url.startsWith('http')) {
    return product.images[0].image_url;
  }
  
  // For locally stored images
  return `http://localhost:8099/uploads/${product.images[0].image_url}`;
};

  const getPriceRange = (product) => {
    if (!product.variants || product.variants.length === 0) return 'N/A';
    
    const prices = product.variants.map(v => v.selling_price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  };

  return (
    <>
    <Search/>
    <Nav/>
    <Logo/>
    <CartLogo/>
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200, mb: 2 }}>
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

        <FormControl sx={{ minWidth: 200, mb: 2 }}>
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

      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.product_id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={getMainImage(product)}
                alt={product.product_name}
                sx={{ cursor: 'pointer', objectFit: 'contain', p: 1 }}
                onClick={() => handleProductClick(product.product_id)}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {product.product_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.brand}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                  <Rating
                    name="read-only"
                    value={product.rating || 4} // Default to 4 if no rating exists
                    precision={0.5}
                    readOnly
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({product.reviewCount || 12})
                  </Typography>
                </Box>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  {getPriceRange(product)}
                </Typography>
                <Chip
                  label={product.category || 'Uncategorized'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add to Cart Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add to Cart</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <img
                  src={getMainImage(selectedProduct)}
                  alt={selectedProduct.product_name}
                  style={{ width: '100%', height: 'auto', borderRadius: 4 }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6">{selectedProduct.product_name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {selectedProduct.brand}
                </Typography>
                <Chip
                  label={selectedProduct.category || 'Uncategorized'}
                  size="small"
                  sx={{ mt: 1, mb: 2 }}
                />
                <Typography variant="body2" paragraph>
                  {selectedProduct.description || 'No description available.'}
                </Typography>
                <Divider sx={{ my: 2 }} />

                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Variant</InputLabel>
                    <Select
                      value={selectedVariant}
                      label="Variant"
                      onChange={(e) => setSelectedVariant(e.target.value)}
                    >
                      {selectedProduct.variants.map((variant) => (
                        <MenuItem key={variant.variant_id} value={variant.variant_id}>
                          {variant.variant_name}: {variant.variant_value} - ${variant.selling_price}
                          {variant.stock_quantity <= 0 && ' (Out of Stock)'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <TextField
                  label="Quantity"
                  type="number"
                  fullWidth
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 0) setQuantity(value);
                  }}
                  inputProps={{ min: 1 }}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddToCartConfirm} variant="contained" color="primary">
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </>
  );
};

export default Store;