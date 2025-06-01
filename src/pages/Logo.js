
import React from "react";
import { useNavigate } from "react-router-dom";
import "./logo.css"; 

const Logo = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/Store"); 
  };

  return (
    <div className="logo-container" onClick={handleClick}>
      <img src="/images/BazaarHub.png" alt="Logo" className="logo-image" />
    </div>
  );
};

export default Logo;
