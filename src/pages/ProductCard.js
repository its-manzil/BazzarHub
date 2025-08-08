import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, showPriceRange = false }) => {
  // Convert and sanitize prices
  const minPrice = Number(product.min_price) || 0;
  const maxPrice = Number(product.max_price) || 0;
  const hasMultiplePrices = minPrice !== maxPrice;

  // Calculate discount percentage
  const discount = maxPrice > 0 && maxPrice > minPrice
    ? Math.round(((maxPrice - minPrice) / maxPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.product_id}`} className="product-link">
      <div className="product-card">
        <div className="product-image-container">
          {product.image_url ? (
            <img 
              src={`http://localhost:8099/uploads/${product.image_url}`} 
              alt={product.product_name}
              className="product-image"
              onError={(e) => {
                e.target.src = '/placeholder-product.png';
              }}
            />
          ) : (
            <div className="product-image-placeholder">
              <span>No Image</span>
            </div>
          )}
          {discount > 0 && (
            <div className="discount-badge">-{discount}%</div>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-title">{product.product_name}</h3>
          <p className="product-brand">{product.brand}</p>

          {product.variant_names && (
            <div className="product-variants">
              Options: {product.variant_names}
            </div>
          )}

          <div className="product-pricing">
            {hasMultiplePrices && showPriceRange ? (
              <>
                {maxPrice > minPrice && (
                  <span className="original-price">
                    ${maxPrice.toFixed(2)}
                  </span>
                )}
                <span className="current-price">
                  From ${minPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <>
                {maxPrice > minPrice && (
                  <span className="original-price">
                    ${maxPrice.toFixed(2)}
                  </span>
                )}
                <span className="current-price">
                  ${minPrice.toFixed(2)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
