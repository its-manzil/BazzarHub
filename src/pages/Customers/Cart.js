import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomerNav from './CustomerNav';
import './cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectAll, setSelectAll] = useState(false);

  // Helper function to safely format prices
  const formatPrice = (price) => {
    const num = Number(price);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  // Fetch cart items from API
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:8099/api/cart', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Ensure we have proper data structure
        const items = response.data.items || response.data || [];
        setCartItems(items);
        setSelectedItems([]); // Reset selection when cart items change
        setSelectAll(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch cart items');
        console.error('Error fetching cart:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [navigate]);

  // Handle quantity change
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `http://localhost:8099/api/cart/${itemId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update local state
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.cart_item_id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  // Handle item selection
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.cart_item_id));
    }
    setSelectAll(!selectAll);
  };

  // Remove selected items
  const removeSelectedItems = async () => {
    if (selectedItems.length === 0) return;

    try {
      const token = localStorage.getItem('authToken');
      await Promise.all(
        selectedItems.map(itemId =>
          axios.delete(`http://localhost:8099/api/cart/${itemId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        )
      );

      // Update local state
      setCartItems(prevItems =>
        prevItems.filter(item => !selectedItems.includes(item.cart_item_id))
      );
      setSelectedItems([]);
      setSelectAll(false);
    } catch (err) {
      console.error('Error removing items:', err);
      alert('Failed to remove items from cart');
    }
  };

  // Calculate totals
  const calculateSelectedTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.cart_item_id))
      .reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0)
      .toFixed(2);
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to checkout');
      return;
    }
    navigate('/checkout', { state: { selectedItems } });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <CustomerNav />
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet</p>
          <button onClick={() => navigate('/store')}>Continue Shopping</button>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomerNav />
      <div className="cart-container">
        <h2 className="cart-title">Your Shopping Cart</h2>
        
        <div className="cart-actions">
          <div className="select-all">
            <input
              type="checkbox"
              id="selectAll"
              checked={selectAll}
              onChange={toggleSelectAll}
            />
            <label htmlFor="selectAll">Select All ({cartItems.length} items)</label>
          </div>
          <button 
            className="remove-selected"
            onClick={removeSelectedItems}
            disabled={selectedItems.length === 0}
          >
            Remove Selected
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-header">
            <span>Select</span>
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
          </div>

          {cartItems.map((item) => (
            <div key={item.cart_item_id} className="cart-item">
              <div className="item-select">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.cart_item_id)}
                  onChange={() => toggleItemSelection(item.cart_item_id)}
                />
              </div>
              
              <div className="product-info">
                <img 
                  src={item.image_url ? `http://localhost:8099/uploads/${item.image_url}` : 'https://via.placeholder.com/100'} 
                  alt={item.product_name}
                  onClick={() => navigate(`/product/${item.product_id}`)}
                />
                <div>
                  <h4 onClick={() => navigate(`/product/${item.product_id}`)}>
                    {item.product_name}
                  </h4>
                  <p className="brand">{item.brand}</p>
                  <p className="variant">
                    {item.variant_name}: {item.variant_value}
                  </p>
                </div>
              </div>
              
              <div className="item-price">{formatPrice(item.price)}</div>
              
              <div className="item-quantity">
                <button 
                  onClick={() => handleQuantityChange(item.cart_item_id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(item.cart_item_id, item.quantity + 1)}
                  disabled={item.quantity >= 10} // Assuming max 10 per item
                >
                  +
                </button>
              </div>
              
              <div className="item-total">
                {formatPrice(Number(item.price) * item.quantity)}
              </div>
            </div>
          ))}

          <div className="cart-summary">
            <div className="summary-details">
              <div className="summary-row">
                <span>Selected Items ({selectedItems.length}):</span>
                <span>{formatPrice(calculateSelectedTotal())}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{formatPrice(calculateSelectedTotal())}</span>
              </div>
            </div>
            
            <div className="checkout-actions">
              <button 
                className="continue-shopping"
                onClick={() => navigate('/store')}
              >
                Continue Shopping
              </button>
              <button 
                className="checkout-button"
                onClick={proceedToCheckout}
                disabled={selectedItems.length === 0}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;