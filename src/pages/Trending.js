import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, IconButton,
  Rating, Divider, Grow
} from '@mui/material';
import { Favorite, Share } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './trending.css';

const Trending = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8099/api/Products');
        const productsWithDiscounts = processProducts(response.data);
        setTrendingProducts(productsWithDiscounts);
      } catch (error) {
        console.error('Error fetching trending products:', error);
      }
    };

    fetchTrendingProducts();
  }, []);

  const processProducts = (products) => {
    const productsWithDiscounts = products.map(product => {
      const variants = product.variants || [];
      
      const discounts = variants.map(variant => {
        const markedPrice = Number(variant.marked_price);
        const sellingPrice = Number(variant.selling_price);
        if (markedPrice <= 0 || sellingPrice >= markedPrice) return 0;
        return ((markedPrice - sellingPrice) / markedPrice) * 100;
      }).filter(d => d > 0);

      const avgDiscount = discounts.length > 0 
        ? discounts.reduce((sum, d) => sum + d, 0) / discounts.length 
        : 0;

      return {
        ...product,
        avgDiscount,
        maxDiscount: discounts.length > 0 ? Math.max(...discounts) : 0,
        minPrice: variants.length > 0 
          ? Math.min(...variants.map(v => Number(v.selling_price))) 
          : 0,
        maxPrice: variants.length > 0 
          ? Math.max(...variants.map(v => Number(v.selling_price))) 
          : 0
      };
    });

    return productsWithDiscounts
      .filter(product => product.avgDiscount > 0)
      .sort((a, b) => b.avgDiscount - a.avgDiscount)
      .slice(0, 12);
  };

  const getMainImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:8099/uploads/${imageUrl}`;
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const toggleWishlist = (productId, e) => {
    e.stopPropagation();
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const getPriceRange = (product) => {
    if (!product.variants || product.variants.length === 0) return 'N/A';
    const prices = product.variants.map(v => Number(v.selling_price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `Rs.${min.toFixed(2)}` : `Rs.${min.toFixed(2)} - Rs.${max.toFixed(2)}`;
  };

  return (
    <Box className="trending-container">
      <Typography variant="h4" className="trending-title">
        Hot Deals 🔥
      </Typography>
      <Typography variant="subtitle1" className="trending-subtitle">
        Don't miss these limited-time offers
      </Typography>

      <Box className="trending-products-scroll">
        {trendingProducts.map((product) => (
          <Grow in={true} key={product.product_id} timeout={500}>
            <Card 
              className={`trending-product-card ${hoveredCard === product.product_id ? 'hovered' : ''}`}
              onClick={() => handleProductClick(product.product_id)}
              onMouseEnter={() => setHoveredCard(product.product_id)}
              onMouseLeave={() => setHoveredCard(null)}
              elevation={hoveredCard === product.product_id ? 6 : 2}
            >
              {/* Discount Badge */}
              <Box className="trending-discount-badge">
                <Chip 
                  label={`${Math.round(product.maxDiscount)}% OFF`} 
                  className="trending-discount-chip"
                />
              </Box>

              {/* Product Image */}
              <Box className="trending-product-image-container">
                <img
                  src={getMainImageUrl(product.images[0]?.image_url)}
                  alt={product.product_name}
                  className="trending-product-image"
                />
              </Box>

              {/* Product Info */}
              <CardContent className="trending-product-info">
                <Box className="trending-product-text">
                  <Typography className="trending-product-name">
                    {product.product_name}
                  </Typography>
                  <Typography className="trending-product-brand">
                    {product.brand}
                  </Typography>
                </Box>
                
                <Box className="trending-product-rating">
                  <Rating
                    value={product.rating || 0}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                </Box>
                
                <Typography className="trending-product-price">
                  {getPriceRange(product)}
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        ))}
      </Box>
    </Box>
  );
};

export default Trending;