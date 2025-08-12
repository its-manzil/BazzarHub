import React, { useState, useEffect } from 'react';
import './ProductsList.css';
import Navbar from '../Navbar';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'product_name', direction: 'asc' });
  const [newVariant, setNewVariant] = useState({
    variant_name: 'Size', // Default to Size as most common variant
    variant_value: '',
    marked_price: '',
    selling_price: '',
    stock_quantity: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8099/api/allProducts');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredProducts = sortedProducts.filter(product => 
    product.product_name.toLowerCase().includes(searchTerm) || 
    product.brand.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm)
  );

  const getPriceRange = (variants) => {
    const prices = variants.map(v => v.selling_price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `Rs.${min}` : `Rs.${min} - Rs.${max}`;
  };

  const handleEditClick = (productId) => {
    setEditingId(editingId === productId ? null : productId);
    setNewVariant({
      variant_name: 'Size',
      variant_value: '',
      marked_price: '',
      selling_price: '',
      stock_quantity: ''
    });
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setNewVariant(prev => ({ ...prev, [name]: value }));
  };

  const handleStockUpdate = async (productId, variantId, newStock) => {
    try {
      const response = await fetch(`http://localhost:8099/api/variants/${variantId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_quantity: newStock })
      });
      if (!response.ok) throw new Error('Failed to update stock');
      
      setProducts(prev => prev.map(product => 
        product.product_id === productId
          ? {
              ...product,
              variants: product.variants.map(v => 
                v.variant_id === variantId 
                  ? { ...v, stock_quantity: parseInt(newStock) || 0 } 
                  : v
              )
            }
          : product
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddVariant = async (productId) => {
    try {
      const response = await fetch(`http://localhost:8099/api/allProducts/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVariant)
      });
      if (!response.ok) throw new Error('Failed to add variant');
      
      const addedVariant = await response.json();
      
      setProducts(prev => prev.map(product => 
        product.product_id === productId
          ? { ...product, variants: [...product.variants, addedVariant] }
          : product
      ));
      
      setNewVariant({
        variant_name: 'Size',
        variant_value: '',
        marked_price: '',
        selling_price: '',
        stock_quantity: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <>
    <Navbar/>
    <div className="products-container">
      <h1>Products Management</h1>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          onChange={handleSearch}
        />
      </div>
      
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('product_name')}>
                Product {sortConfig.key === 'product_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('brand')}>
                Brand {sortConfig.key === 'brand' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('category')}>
                Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Price Range</th>
              <th>Total Variants</th>
              <th>Total Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <React.Fragment key={product.product_id}>
                  <tr>
                    <td>{product.product_name}</td>
                    <td>{product.brand}</td>
                    <td>{product.category}</td>
                    <td>{getPriceRange(product.variants)}</td>
                    <td>{product.variants.length}</td>
                    <td>{product.variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)}</td>
                    <td>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditClick(product.product_id)}
                      >
                        {editingId === product.product_id ? 'Close' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                  {editingId === product.product_id && (
                    <tr className="edit-row">
                      <td colSpan="7">
                        <div className="variant-edit-section">
                          <h4>Edit Variants</h4>
                          <div className="variants-grid">
                            {product.variants.map(variant => (
                              <div key={variant.variant_id} className="variant-card">
                                <p><strong>{variant.variant_name}:</strong> {variant.variant_value}</p>
                                <p><strong>Price:</strong> Rs.{variant.selling_price}</p>
                                <div className="stock-control">
                                  <label>Stock:</label>
                                  <input
                                    type="number"
                                    value={variant.stock_quantity}
                                    onChange={(e) => handleStockUpdate(
                                      product.product_id,
                                      variant.variant_id, 
                                      e.target.value
                                    )}
                                    min="0"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <h4>Add New Variant</h4>
                          <div className="add-variant-form">
                            <div className="form-group">
                              <label>Type:</label>
                              <select
                                name="variant_name"
                                value={newVariant.variant_name}
                                onChange={handleVariantChange}
                              >
                                <option value="Size">Size</option>
                                <option value="Color">Color</option>
                                <option value="Weight">Weight</option>
                                <option value="Style">Style</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Value:</label>
                              <input
                                type="text"
                                name="variant_value"
                                value={newVariant.variant_value}
                                onChange={handleVariantChange}
                                placeholder="e.g., Large, Red, etc."
                              />
                            </div>
                            <div className="form-group">
                              <label>Marked Price (Rs.):</label>
                              <input
                                type="number"
                                name="marked_price"
                                value={newVariant.marked_price}
                                onChange={handleVariantChange}
                                min="0"
                                step="1"
                              />
                            </div>
                            <div className="form-group">
                              <label>Selling Price (Rs.):</label>
                              <input
                                type="number"
                                name="selling_price"
                                value={newVariant.selling_price}
                                onChange={handleVariantChange}
                                min="0"
                                step="1"
                              />
                            </div>
                            <div className="form-group">
                              <label>Stock Quantity:</label>
                              <input
                                type="number"
                                name="stock_quantity"
                                value={newVariant.stock_quantity}
                                onChange={handleVariantChange}
                                min="0"
                              />
                            </div>
                            <button 
                              className="add-variant-btn"
                              onClick={() => handleAddVariant(product.product_id)}
                            >
                              Add Variant
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-results">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export default ProductsList;