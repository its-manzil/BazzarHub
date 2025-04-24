// store.js
import React, { useState } from "react";
import "./store.css";
// import { FiSearch } from "react-icons/fi";
import Nav from "./Nav";
import Search from './Search';
import Logo from "./Logo"
import CartLogo from "./CartLogo";

const categories = ["All", "Electronics", "Fashion", "Home", "Books", "Grocery"];

const productsData = [
  { id: 1, name: "Smartphone", price: "₨ 22,000", category: "Electronics", image: "/images/smartphone.jpg" },
  { id: 2, name: "Sneakers", price: "₨ 5,000", category: "Fashion", image: "/images/smartphone.jpg" },
  { id: 3, name: "Bluetooth Speaker", price: "₨ 3,200", category: "Electronics", image: "/images/smartphone.jpg" },
  { id: 4, name: "Backpack", price: "₨ 2,800", category: "Fashion", image: "/images/smartphone.jpg" },
  { id: 5, name: "Cooking Pan Set", price: "₨ 3,900", category: "Home", image: "/images/smartphone.jpg" },
  { id: 6, name: "Book", price: "₨ 800", category: "Books", image: "/images/smartphone.jpg" },
  // Adding more products to demonstrate scrolling
  { id: 7, name: "Laptop", price: "₨ 55,000", category: "Electronics", image: "/images/smartphone.jpg" },
  { id: 8, name: "T-Shirt", price: "₨ 1,200", category: "Fashion", image: "/images/smartphone.jpg" },
  { id: 9, name: "Headphones", price: "₨ 4,500", category: "Electronics", image: "/images/smartphone.jpg" },
  { id: 10, name: "Jeans", price: "₨ 2,500", category: "Fashion", image: "/images/smartphone.jpg" },
  { id: 11, name: "Coffee Maker", price: "₨ 6,800", category: "Home", image: "/images/smartphone.jpg" },
  { id: 12, name: "Notebook", price: "₨ 300", category: "Books", image: "/images/smartphone.jpg" }
];

function Store() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = productsData.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Nav />
      <Logo/>
      <CartLogo/>
      <section className="store-section">
        <div className="store-header-container">
          <div className="store-header">
            <h1 className="store-title">Welcome 2 BazaarHub Store</h1>
            <Search/>
          </div>

          <div className="store-controls-sticky">
            

            <div className="category-scroll-container">
              <div className="category-bar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`category-button ${selectedCategory === cat ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                    aria-label={`Filter by ${cat}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="product-container">
          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="product-price">{product.price}</p>
                    <button className="buy-button">Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results-container">
              <p className="no-results">No products found matching your criteria</p>
              <button 
                className="reset-filters" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Store;