// Checkout.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import CustomerNav from './CustomerNav';
import './checkout.css';

// Nepal's data
const countries = ['Nepal', 'India', 'China', 'Bhutan'];
const nepalProvinces = {
  'Province 1': ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur'],
  'Madhesh': ['Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha'],
  'Bagmati': ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok'],
  'Gandaki': ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahu'],
  'Lumbini': ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Gulmi', 'Kapilvastu', 'Palpa', 'Pyuthan', 'Rolpa', 'Rukum', 'Rupandehi'],
  'Karnali': ['Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Salyan', 'Surkhet'],
  'Sudurpashchim': ['Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur']
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    username: '',
    pin: ''
  });
  const [address, setAddress] = useState({
    country: 'Nepal',
    province: '',
    district: '',
    landmark: '',
    street: ''
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Format price in Nepali Rupees
  const formatPrice = (price) => {
    const num = Number(price);
    return isNaN(num) ? 'Rs. 0.00' : `Rs. ${num.toFixed(2)}`;
  };

  // Initialize with selected items from cart
  useEffect(() => {
    if (location.state?.selectedItems) {
      fetchCartItems(location.state.selectedItems);
    } else {
      navigate('/cart');
    }
  }, [location.state, navigate]);

  // Fetch cart items from API
  const fetchCartItems = async (selectedItemIds) => {
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

      const items = response.data.items || response.data || [];
      const selectedItems = items.filter(item => selectedItemIds.includes(item.cart_item_id));
      setCartItems(selectedItems);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart items');
      console.error('Error fetching cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0)
      .toFixed(2);
  };

  // Handle address change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => {
      // Reset district when province changes
      if (name === 'province') {
        return { ...prev, province: value, district: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  // Handle payment method selection
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setShowPaymentForm(method === 'esewa' || method === 'khalti');
    setPaymentDetails({ username: '', pin: '' }); // Reset payment details
  };

  // Handle payment details change
  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    // Basic validation for username (10 digits) and pin (4 digits)
    if (name === 'username' && !/^\d{0,10}$/.test(value)) return;
    if (name === 'pin' && !/^\d{0,4}$/.test(value)) return;
    
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!address.country || !address.province || !address.district || !address.street) {
      alert('Please fill in all address fields');
      return false;
    }

    if (!paymentMethod) {
      alert('Please select a payment method');
      return false;
    }

    if ((paymentMethod === 'esewa' || paymentMethod === 'khalti')) {
      if (paymentDetails.username.length !== 10) {
        alert('Payment username must be 10 digits');
        return false;
      }
      if (paymentDetails.pin.length !== 4) {
        alert('Payment PIN must be 4 digits');
        return false;
      }
    }

    return true;
  };

  // Place order
  const placeOrder = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      const orderData = {
        items: cartItems.map(item => ({
          cart_item_id: item.cart_item_id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: {
          country: address.country,
          province: address.province,
          district: address.district,
          street: address.street,
          landmark: address.landmark
        },
        payment_method: paymentMethod,
        payment_details: paymentMethod !== 'cod' ? paymentDetails : null,
        total_amount: calculateTotal()
      };

      const response = await axios.post(
        'http://localhost:8099/api/orders',
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setOrderDetails(response.data);
      setOrderPlaced(true);
      
    } catch (err) {
      console.error('Error placing order:', err);
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading checkout...</p>
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

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <>
        <CustomerNav />
        <div className="empty-cart">
          <h2>No items to checkout</h2>
          <p>Your cart is empty or no items were selected</p>
          <button onClick={() => navigate('/cart')}>Back to Cart</button>
        </div>
      </>
    );
  }

  if (orderPlaced && orderDetails) {
    return (
      <>
        <CustomerNav />
        <div className="order-success">
          <h2>Order Placed Successfully!</h2>
          <div className="receipt">
            <h3>Payment Receipt</h3>
            <p><strong>Order ID:</strong> {orderDetails.order_id}</p>
            <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
            <p><strong>Payment Method:</strong> {orderDetails.payment_method.toUpperCase()}</p>
            <p><strong>Amount Paid:</strong> {formatPrice(orderDetails.total_amount)}</p>
            {orderDetails.payment_method !== 'cod' && (
              <>
                <p><strong>Transaction ID:</strong> {orderDetails.transaction_id}</p>
                <p><strong>Payment Status:</strong> Completed</p>
              </>
            )}
            <div className="receipt-items">
              <h4>Items Purchased:</h4>
              {orderDetails.items.map((item, index) => (
                <div key={index} className="receipt-item">
                  <p>{item.product_name} ({item.variant_value})</p>
                  <p>{item.quantity} x {formatPrice(item.price)}</p>
                </div>
              ))}
            </div>
            <div className="receipt-total">
              <p><strong>Total:</strong> {formatPrice(orderDetails.total_amount)}</p>
            </div>
          </div>
          
          <div className="order-actions">
            <button onClick={() => navigate('/orders')}>View Orders</button>
            <button onClick={() => navigate('/store')}>Continue Shopping</button>
            <button onClick={() => window.print()}>Print Receipt</button>
            <button onClick={() => downloadReceipt(orderDetails.order_id)}>Download Receipt</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomerNav />
      <div className="checkout-container">
        <h2 className="checkout-title">Checkout</h2>
        
        <div className="checkout-content">
          <div className="checkout-section">
            <h3>Shipping Address</h3>
            
            <div className="address-form">
              <div className="form-group">
                <label>Country</label>
                <select 
                  name="country" 
                  value={address.country}
                  onChange={handleAddressChange}
                  required
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              
              {address.country === 'Nepal' && (
                <>
                  <div className="form-group">
                    <label>Province</label>
                    <select 
                      name="province" 
                      value={address.province}
                      onChange={handleAddressChange}
                      required
                    >
                      <option value="">Select Province</option>
                      {Object.keys(nepalProvinces).map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                  
                  {address.province && (
                    <div className="form-group">
                      <label>District</label>
                      <select 
                        name="district" 
                        value={address.district}
                        onChange={handleAddressChange}
                        required
                      >
                        <option value="">Select District</option>
                        {nepalProvinces[address.province].map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
              
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  placeholder="Street name and house number"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Landmark (Optional)</label>
                <input
                  type="text"
                  name="landmark"
                  value={address.landmark}
                  onChange={handleAddressChange}
                  placeholder="Nearby landmark"
                />
              </div>
            </div>
          </div>
          
          <div className="checkout-section">
            <h3>Payment Method</h3>
            
            <div className="payment-methods">
              <div 
                className={`payment-option ${paymentMethod === 'esewa' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('esewa')}
              >
                <div className="payment-logo">
                  <img src="/esewa-logo.png" alt="eSewa" />
                </div>
                <span>eSewa</span>
              </div>
              
              <div 
                className={`payment-option ${paymentMethod === 'khalti' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('khalti')}
              >
                <div className="payment-logo">
                  <img src="/khalti-logo.png" alt="Khalti" />
                </div>
                <span>Khalti</span>
              </div>
              
              <div 
                className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('cod')}
              >
                <div className="payment-logo">
                  <img src="/cod-icon.png" alt="Cash on Delivery" />
                </div>
                <span>Cash on Delivery</span>
              </div>
            </div>
            
            {showPaymentForm && (
              <div className="payment-form">
                <div className="form-group">
                  <label>{paymentMethod === 'esewa' ? 'eSewa ID (10 digits)' : 'Khalti ID (10 digits)'}</label>
                  <input
                    type="text"
                    name="username"
                    value={paymentDetails.username}
                    onChange={handlePaymentDetailsChange}
                    placeholder={`Enter ${paymentMethod} ID`}
                    maxLength="10"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>PIN (4 digits)</label>
                  <input
                    type="password"
                    name="pin"
                    value={paymentDetails.pin}
                    onChange={handlePaymentDetailsChange}
                    placeholder="Enter your PIN"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="checkout-section">
            <h3>Order Summary</h3>
            
            <div className="order-items">
              {cartItems.map(item => (
                <div key={item.cart_item_id} className="order-item">
                  <div className="item-info">
                    <img 
                      src={item.image_url ? `http://localhost:8099/uploads/${item.image_url}` : 'https://via.placeholder.com/60'} 
                      alt={item.product_name}
                    />
                    <div>
                      <h4>{item.product_name}</h4>
                      <p>{item.variant_name}: {item.variant_value}</p>
                      <p>Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="item-price">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>
            
            <button 
              className="place-order-btn"
              onClick={placeOrder}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Function to download receipt (would be implemented in your API)
const downloadReceipt = async (orderId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(
      `http://localhost:8099/api/orders/${orderId}/receipt`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `receipt_${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error downloading receipt:', error);
    alert('Failed to download receipt');
  }
};

export default Checkout;