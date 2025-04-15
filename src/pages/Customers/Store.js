import React from "react";
import "./store.css";
import { FiSearch } from "react-icons/fi";

function Store() {
  const products = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: "$49.99",
      image: "https://via.placeholder.com/300x300?text=Headphones",
    },
    {
      id: 2,
      name: "Smart Watch",
      price: "$89.99",
      image: "https://via.placeholder.com/300x300?text=Smart+Watch",
    },
    {
      id: 3,
      name: "Bluetooth Speaker",
      price: "$29.99",
      image: "https://via.placeholder.com/300x300?text=Speaker",
    },
    {
      id: 4,
      name: "Gaming Mouse",
      price: "$39.99",
      image: "https://via.placeholder.com/300x300?text=Gaming+Mouse",
    },
  ];

  return (
    <div className="store-container">
      <h1 className="store-title">BazaarHub Store</h1>

      <form className="search-form">
        <div className="search-input-group">
          <FiSearch className="search-icon" />
          <input
            type="search"
            className="search-input"
            placeholder="Search your products..."
            aria-label="Search your products"
          />
        </div>
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.price}</p>
            <button>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Store;
