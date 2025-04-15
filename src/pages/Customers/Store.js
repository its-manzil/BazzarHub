import React, { useState } from "react";
import "./store.css";
import { FiSearch } from "react-icons/fi";
import Nav from "./Nav";

const categories = ["All", "Electronics", "Fashion", "Home", "Books", "Grocery"];

const productsData = [
  { id: 1, name: "Smartphone", price: "₨ 22,000", category: "Electronics", image: "/images/smartphone.jpg" },
  { id: 2, name: "Sneakers", price: "₨ 5,000", category: "Fashion", image: "/images/smartphone.jpg" },
  { id: 3, name: "Bluetooth Speaker", price: "₨ 3,200", category: "Electronics", image: "/images/smartphone.jpg" },
  { id: 4, name: "Backpack", price: "₨ 2,800", category: "Fashion", image: "/images/smartphone.jpg" },
  { id: 5, name: "Cooking Pan Set", price: "₨ 3,900", category: "Home", image: "/images/smartphone.jpg" },
  { id: 6, name: "Book", price: "₨ 800", category: "Books", image: "/images/smartphone.jpg" }
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
      <section className="store-section">
        <h2 className="store-title">🛒 Welcome to BazaarHub Store</h2>

        <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
          <div className="search-group">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

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

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>{product.price}</p>
                  <button className="buy-button">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-results">No products found.</p>
        )}
      </section>
    </>
  );
}

export default Store;
