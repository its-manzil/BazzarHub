import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import CustomerNav from './CustomerNav';
import './checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [address, setAddress] = useState({
    country: 'Nepal',
    zone: '',
    district: '',
    landmark: '',
    street: ''
  });
  const [zones, setZones] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Nepal zones and districts data
  const nepalLocations = {
    zones: [
      { name: 'Province 1', districts: ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur'] },
      { name: 'Province 2', districts: ['Parsa', 'Bara', 'Rautahat', 'Sarlahi', 'Dhanusha', 'Mahottari', 'Saptari', 'Siraha'] },
      { name: 'Bagmati Province', districts: ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok'] },
      { name: 'Gandaki Province', districts: ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun'] },
      { name: 'Province 5', districts: ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Gulmi', 'Kapilvastu', 'Palpa', 'Pyuthan', 'Rolpa', 'Rukum', 'Rupandehi'] },
      { name: 'Karnali Province', districts: ['Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Salyan', 'Surkhet', 'Western Rukum'] },
      { name: 'Sudurpashchim Province', districts: ['Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur'] }
    ]
  };

  // Format price helper
  const formatPrice = (price) => {
    const num = Number(price);
    return isNaN(num) ? 'Rs. 0.00' : `Rs. ${num.toFixed(2)}`;
  };

  // Fetch cart items based on selected items from Cart page
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        // Get selected items from location state
        const selectedItems = location.state?.selectedItems || [];
        if (selectedItems.length === 0) {
          navigate('/cart');
          return;
        }

        // Fetch all cart items
        const response = await axios.get('http://localhost:8099/api/cart', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Filter only selected items
        const allItems = response.data.items || response.data || [];
        const selectedCartItems = allItems.filter(item => 
          selectedItems.includes(item.cart_item_id)
        );

        setCartItems(selectedCartItems);
        setZones(nepalLocations.zones.map(zone => zone.name));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch cart items');
        console.error('Error fetching cart:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [navigate, location.state]);

  // Update districts when zone changes
  useEffect(() => {
    if (address.zone) {
      const selectedZone = nepalLocations.zones.find(z => z.name === address.zone);
      if (selectedZone) {
        setDistricts(selectedZone.districts);
        setAddress(prev => ({ ...prev, district: '' })); // Reset district when zone changes
      }
    } else {
      setDistricts([]);
    }
  }, [address.zone]);

  // Handle address change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    // Reset payment details when method changes
    setPaymentDetails({});
  };

  // Handle payment details change
  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => 
      total + (Number(item.price) * Number(item.quantity)), 0
    ).toFixed(2);
  };

  // Place order
  const placeOrder = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Validate address
      if (!address.zone || !address.district || !address.street) {
        alert('Please fill in all required address fields');
        return;
      }

      // Validate payment details based on method
      if (paymentMethod === 'esewa' || paymentMethod === 'khalti') {
        if (!paymentDetails.username || !paymentDetails.pin) {
          alert(`Please enter your ${paymentMethod} username and PIN`);
          return;
        }
      }

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: address,
        payment_method: paymentMethod,
        payment_details: paymentDetails
      };

      // Submit order
      const response = await axios.post(
        'http://localhost:8099/api/orders',
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Handle success
      setOrderSuccess(true);
      setOrderData(response.data);
      
      // Optionally clear cart items that were ordered
      // You might want to implement this in your backend

    } catch (err) {
      console.error('Order error:', err);
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  // Download invoice
  const downloadInvoice = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:8099/api/orders/${orderData.order_id}/invoice`,
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
      link.setAttribute('download', `invoice_${orderData.order_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download invoice');
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

  if (orderSuccess) {
    return (
      <>
        <CustomerNav />
        <div className="order-success-container">
          <div className="order-success-card">
            <h2>Order Placed Successfully!</h2>
            <p>Your order ID: <strong>{orderData.order_id}</strong></p>
            <p>Total Amount: <strong>{formatPrice(orderData.total_amount)}</strong></p>
            <p>Payment Method: <strong>{orderData.payment_method}</strong></p>
            <p>Thank you for your purchase!</p>
            
            <div className="order-actions">
              <button onClick={downloadInvoice} className="download-invoice">
                Download Invoice
              </button>
              <button 
                onClick={() => navigate('/store')}
                className="continue-shopping"
              >
                Continue Shopping
              </button>
            </div>
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
                <input 
                  type="text" 
                  name="country" 
                  value={address.country} 
                  onChange={handleAddressChange}
                  disabled
                />
              </div>
              
              <div className="form-group">
                <label>Zone/Province*</label>
                <select
                  name="zone"
                  value={address.zone}
                  onChange={handleAddressChange}
                  required
                >
                  <option value="">Select Zone</option>
                  {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>District*</label>
                <select
                  name="district"
                  value={address.district}
                  onChange={handleAddressChange}
                  required
                  disabled={!address.zone}
                >
                  <option value="">Select District</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Street Address*</label>
                <input
                  type="text"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  placeholder="House number and street name"
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
                  placeholder="Nearby landmark for delivery"
                />
              </div>
            </div>
          </div>
          
          <div className="checkout-section">
            <h3>Payment Method</h3>
            <div className="payment-methods">
              <div 
                className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => handlePaymentMethodChange('cash')}
              >
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  checked={paymentMethod === 'cash'}
                  onChange={() => {}}
                />
                <label>Cash on Delivery</label>
              </div>
              
              <div 
                className={`payment-option ${paymentMethod === 'esewa' ? 'active' : ''}`}
                onClick={() => handlePaymentMethodChange('esewa')}
              >
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  checked={paymentMethod === 'esewa'}
                  onChange={() => {}}
                />
                <label>Esewa</label>
              </div>
              
              <div 
                className={`payment-option ${paymentMethod === 'khalti' ? 'active' : ''}`}
                onClick={() => handlePaymentMethodChange('khalti')}
              >
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  checked={paymentMethod === 'khalti'}
                  onChange={() => {}}
                />
                <label>Khalti</label>
              </div>
            </div>
            
            {(paymentMethod === 'esewa' || paymentMethod === 'khalti') && (
              <div className="payment-details-form">
                <div className="form-group">
                  <label>{paymentMethod === 'esewa' ? 'Esewa ID' : 'Khalti ID'}*</label>
                  <input
                    type="text"
                    name="username"
                    value={paymentDetails.username || ''}
                    onChange={handlePaymentDetailsChange}
                    placeholder={paymentMethod === 'esewa' ? 'Esewa username or mobile number' : 'Khalti mobile number'}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>PIN*</label>
                  <input
                    type="password"
                    name="pin"
                    value={paymentDetails.pin || ''}
                    onChange={handlePaymentDetailsChange}
                    placeholder={`${paymentMethod} PIN`}
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
                  <div className="item-image">
                    <img 
                      src={item.image_url ? `http://localhost:8099/uploads/${item.image_url}` : 'https://via.placeholder.com/80'} 
                      alt={item.product_name}
                    />
                  </div>
                  <div className="item-details">
                    <h4>{item.product_name}</h4>
                    <p>{item.variant_name}: {item.variant_value}</p>
                    <p>Qty: {item.quantity}</p>
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
              className="place-order-button"
              onClick={placeOrder}
              disabled={isLoading}
            >
              {isLoading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;