import React, { useState } from 'react';
import { Button } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import axios from 'axios';

const AddToCartButton = ({ 
  productId, 
  selectedVariants, 
  quantities, 
  disabled = false,
  onSuccess,
  onError,
  onNotLoggedIn
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddToCart = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      onNotLoggedIn();
      return;
    }

    const selectedVariantIds = Object.keys(selectedVariants).filter(
      variantId => selectedVariants[variantId]
    );

    if (selectedVariantIds.length === 0) {
      onError('Please select at least one variant');
      return;
    }

    setIsLoading(true);
    
    try {
      const requests = selectedVariantIds.map(variantId => {
        const payload = {
          productId,
          variantId,
          quantity: quantities[variantId] || 1
        };
        
        return axios.post(
          'http://localhost:8099/api/cart',
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      });

      await Promise.all(requests);
      onSuccess();
    } catch (error) {
      console.error('Add to cart error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token'); // Clear invalid token
        onNotLoggedIn();
      } else {
        const errorMessage = error.response?.data?.message || 
                          'Failed to add to cart';
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<ShoppingCart />}
      onClick={handleAddToCart}
      disabled={disabled || isLoading}
      fullWidth
      size="large"
    >
      {isLoading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
};

export default AddToCartButton;