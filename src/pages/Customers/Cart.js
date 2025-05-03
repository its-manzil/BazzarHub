import React from 'react';
import Nav from './Nav';
import Logo from './Logo';
import './cart.css';
import CartLogo from './CartLogo';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const navigate = useNavigate();
  const cartItems = [
    {
      id: 1,
      name: 'Product 1',
      price: 120,
      quantity: 2,
      image: 'https://via.placeholder.com/100',
    },
    {
      id: 2,
      name: 'Product 2',
      price: 80,
      quantity: 1,
      image: 'https://via.placeholder.com/100',
    },
  ];

  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  
    
  const handleClick = () => {
    navigate("/Checkout"); 
  };


  return (
    <>
    <h1 className="cart-heading">Your Cart</h1>
      <Nav />
      <CartLogo/>
      <div className="cart-wrapper">
        
        <div className="cart-main">
          <div className="cart-title">
            <Logo />
          </div>

          <div className="cart-box">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="item-image" />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p>Price: ${item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-total">
                    <p>Total: ${item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Total Amount: ${calculateTotal()}</h3>
              
              <button className="checkout-btn" onClick={handleClick}>Proceed to Checkout</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
