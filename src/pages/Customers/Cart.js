import React from 'react';
import Nav from './Nav';
import Logo from './Logo';
import './cart.css';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const navigate = useNavigate();

  const cartItems = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 150,
      quantity: 2,
      image: 'https://via.placeholder.com/100',
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: 200,
      quantity: 1,
      image: 'https://via.placeholder.com/100',
    },
  ];

  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <>
      <Nav />
      <div className="cart-container">
        <Logo />
        <h2 className="cart-title">Your Shopping Cart</h2>
        <div className="cart-content">
          <div className="cart-header">
            <span>Product</span>
            <span>Quantity</span>
            <span>Rate</span>
            <span>Total</span>
          </div>

          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="product-info">
                <img src={item.image} alt={item.name} />
                <p>{item.name}</p>
              </div>
              <p>{item.quantity}</p>
              <p>${item.price}</p>
              <p>${item.price * item.quantity}</p>
            </div>
          ))}

          <div className="cart-summary">
            <h3>Total Amount: ${calculateTotal()}</h3>
            <button className="checkout-button" onClick={() => navigate('/Checkout')}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
