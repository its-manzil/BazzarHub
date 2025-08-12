import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import './productsList.css';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:8099/api/products');
        setProducts(res.data.products || []);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Navbar />
      <div className="productslist-container">
        <header className="productslist-header">
          <h1 className="productslist-title">Products</h1>
          <p className="productslist-subtitle">Manage your product listings</p>
        </header>

        {error && <div className="productslist-alert error">{error}</div>}

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="productslist-table-wrapper">
            <table className="productslist-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price (Rs.)</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  const prices = product.variants?.map(v => v.sellingPrice) || [];
                  const stockQty = product.variants?.reduce((acc, v) => acc + (v.stockQuantity || 0), 0) || 0;
                  const minPrice = prices.length ? Math.min(...prices) : 0;

                  return (
                    <tr key={product.id}>
                      <td>{product.productName}</td>
                      <td>{product.brand}</td>
                      <td>{product.category}</td>
                      <td>Rs.{minPrice.toFixed(2)}</td>
                      <td>{stockQty > 0 ? stockQty : 'Out of stock'}</td>
                      <td>
                        <button className="btn-edit" title="Edit Product">Edit</button>
                        <button className="btn-delete" title="Delete Product">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsList;
