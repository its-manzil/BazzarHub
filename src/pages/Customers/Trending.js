import React from 'react';
import './trending.css';

const Trending = () => {
  // Sample trending products data
  const trendingProducts = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: '$99.99',
      image: '',
      rating: 4.5
    },
    {
      id: 2,
      name: 'Smart Watch Pro',
      price: '$199.99',
      image: 'https://via.placeholder.com/200x200?text=Smart+Watch',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Bluetooth Speaker',
      price: '$59.99',
      image: 'https://via.placeholder.com/200x200?text=Speaker',
      rating: 4.2
    },
    {
      id: 4,
      name: 'Gaming Keyboard',
      price: '$79.99',
      image: 'https://via.placeholder.com/200x200?text=Keyboard',
      rating: 4.7
    },
    {
      id: 5,
      name: 'Wireless Mouse',
      price: '$39.99',
      image: 'https://via.placeholder.com/200x200?text=Mouse',
      rating: 4.3
    },
    {
      id: 6,
      name: '4K Webcam',
      price: '$129.99',
      image: 'https://via.placeholder.com/200x200?text=Webcam',
      rating: 4.6
    },
    {
      id: 7,
      name: 'Portable SSD',
      price: '$149.99',
      image: 'https://via.placeholder.com/200x200?text=SSD',
      rating: 4.9
    },
    {
      id: 8,
      name: 'Noise Cancelling Earbuds',
      price: '$159.99',
      image: 'https://via.placeholder.com/200x200?text=Earbuds',
      rating: 4.4
    }
  ];

  return (
    <div className="trending-container">
      <h2 className="trending-title">Trending Now</h2>
      <div className="trending-scroll-container">
        <div className="trending-products">
          {trendingProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-overlay">
                  <button className="add-to-cart">Add to Cart</button>
                </div>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`star ${i < Math.floor(product.rating) ? 'filled' : ''}`}>
                      {i < Math.floor(product.rating) ? '★' : '☆'}
                    </span>
                  ))}
                  <span className="rating-value">{product.rating}</span>
                </div>
                <p className="product-price">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trending;