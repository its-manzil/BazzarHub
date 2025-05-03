import React, { useState } from "react";
import Nav from "./Nav";
import Logo from "./Logo";
import Search from "./Search";
import CartLogo from "./CartLogo";
import "./store.css";

const products = [
  { id: 1, name: "Apple", price: "$1.00", image: "./images/Product 1.jpg", category: "Fruits" },
  { id: 2, name: "Banana", price: "$0.50", image: "./images/Product 1.jpg", category: "Fruits" },
  { id: 3, name: "Carrot", price: "$0.30", image: "./images/Product 1.jpg", category: "Vegetables" },
  { id: 4, name: "Tomato", price: "$0.40", image: "./images/Product 1.jpg", category: "Vegetables" },
  { id: 5, name: "Bread", price: "$1.50", image: "./images/Product 1.jpg", category: "Bakery" },
  { id: 6, name: "Cake", price: "$2.00", image: "./images/Product 1.jpg", category: "Bakery" },
  { id: 7, name: "Orange", price: "$0.70", image: "./images/Product 1.jpg", category: "Fruits" },
  { id: 8, name: "Potato", price: "$0.20", image: "./images/Product 1.jpg", category: "Vegetables" },
  { id: 9, name: "Milk", price: "$1.20", image: "./images/Product 1.jpg", category: "Dairy" },
  { id: 10, name: "Cheese", price: "$1.80", image: "./images/Product 1.jpg", category: "Dairy" },
  { id: 11, name: "Muffin", price: "$1.00", image: "./images/Product 1.jpg", category: "Bakery" },
  { id: 12, name: "Yogurt", price: "$0.90", image: "./images/Product 1.jpg", category: "Dairy" },
];

const categories = ["All", "Fruits", "Vegetables", "Bakery", "Dairy"];

export default function Store() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="store-wrapper">
      <header className="store-header-fixed">
        <Nav />
        <Logo />
        <CartLogo />
        <div className="store-header">
          <h1 className="store-title">Welcome 2 BazaarHub Store</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        <div className="store-controls-sticky">
          <div className="category-scroll-container">
            <div className="category-bar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-button ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="store-product-scrollable">
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
      </main>
    </div>
  );
}
