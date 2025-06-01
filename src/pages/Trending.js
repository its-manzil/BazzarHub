import React from "react";
import "./trending.css";

const trendingProducts = [
  { id: 1, name: "Apple", price: "$1.00", image: "./images/Product 1.jpg" },
  { id: 2, name: "Banana", price: "$0.50", image: "./images/Product 1.jpg" },
  { id: 3, name: "Carrot", price: "$0.30", image: "./images/Product 1.jpg" },
  { id: 4, name: "Tomato", price: "$0.40", image: "./images/Product 1.jpg" },
  { id: 5, name: "Bread", price: "$1.50", image: "./images/Product 1.jpg" },
  { id: 6, name: "Cake", price: "$2.00", image: "./images/Product 1.jpg" },
  { id: 7, name: "Orange", price: "$0.70", image: "./images/Product 1.jpg" },
  { id: 8, name: "Potato", price: "$0.20", image: "./images/Product 1.jpg" },
  { id: 9, name: "Milk", price: "$1.20", image: "./images/Product 1.jpg" },
  { id: 10, name: "Cheese", price: "$1.80", image: "./images/Product 1.jpg" },
  { id: 11, name: "Muffin", price: "$1.00", image: "./images/Product 1.jpg" },
  { id: 12, name: "Yogurt", price: "$0.90", image: "./images/Product 1.jpg" },
];

export default function Trending() {
  return (
    <section className="trending-container">
      <h2 className="trending-title">Trending Products</h2>
      <div className="trending-product-grid">
        {trendingProducts.slice(0, 6).map((product) => (
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
    </section>
  );
}
