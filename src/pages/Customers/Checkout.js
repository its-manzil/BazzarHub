import React, { useState } from 'react';
import Nav from './Nav';
import Logo from './Logo';
import './checkout.css';

const Checkout = () => {
  const [location, setLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const totalAmount = 320; // Sample value (can be passed via context or props)

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Order placed!\nLocation: ${location}\nPayment: ${paymentMethod}`);
  };

  return (
    <>
      <h1 className="checkout-heading">Checkout</h1>
      <Nav />
      <div className="checkout-wrapper">
        <div className="checkout-main">
          <div className="checkout-title">
            <Logo />
          </div>

          <div className="checkout-box">
            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="location">Delivery Location:</label>
                <input
                  type="text"
                  id="location"
                  placeholder="Enter delivery address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Amount:</label>
                <input type="text" value={`$${totalAmount}`} readOnly />
              </div>

              <div className="form-group">
                <label>Payment Method:</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                    />
                    Cash on Delivery
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Online Payment"
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    Online Payment
                  </label>
                </div>

                {/* Conditionally render payment gateway icons */}
                {paymentMethod === 'Online Payment' && (
                  <div className="payment-gateway-icons">
                    <img
                      src="./images/home1.jpg"
                      alt="PayPal"
                      className="payment-icon"
                    />
                    <img
                      src="./images/khalti.png"
                      alt="Khalti"
                      className="payment-icon"
                    />
                    
                  </div>
                )}
              </div>

              <button type="submit" className="checkout-btn">
                Confirm Order
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
