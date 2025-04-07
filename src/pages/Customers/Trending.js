import React from 'react';
import './trending.css';

const Trending = () => {
  // Sample trending products data
  const trendingProducts = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: '$99.99',
      image: 'data:image/jpeg;base64,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',
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