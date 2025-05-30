
import React from "react";
import { useNavigate } from "react-router-dom";
import "./cartlogo.css"; 

const CartLogo = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/Cart"); 
  };

  return (
    <div className="cartlogo-container" onClick={handleClick}>
      <img src="/images/cartlogo.png" alt="Logo" className="cartlogo-image" />
    </div>
  );
};

export default CartLogo;
