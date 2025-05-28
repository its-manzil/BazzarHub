import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaMinus, FaTrash, FaUpload } from 'react-icons/fa';
import './AddProducts.css';
import Navbar from '../Navbar';

const AddProducts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  
  // Variant type options
  const variantTypes = [
    { value: 'Size', label: 'Size' },
    { value: 'Color', label: 'Color' }
  ];

  // Main product form state
  const [product, setProduct] = useState({
    product_name: '',
    brand: '',
    description: '',
    variants: [{
      variant_type: 'Size', // Default to Size
      variant_value: '',
      marked_price: '',
      selling_price: '',
      stock_quantity: '',
      sku: ''
    }],
    images: []
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  // Handle variant changes
  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVariants = [...product.variants];
    updatedVariants[index] = { ...updatedVariants[index], [name]: value };
    
    // Auto-calculate selling price if marked price changes
    if (name === 'marked_price') {
      const discount = updatedVariants[index].selling_price 
        ? (updatedVariants[index].marked_price - updatedVariants[index].selling_price) 
        : 0;
      updatedVariants[index].selling_price = (parseFloat(value) - discount).toFixed(2);
    }
    
    setProduct(prev => ({ ...prev, variants: updatedVariants }));
  };

  // Add new variant
  const addVariant = () => {
    setProduct(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          variant_type: 'Size', // Default to Size
          variant_value: '',
          marked_price: '',
          selling_price: '',
          stock_quantity: '',
          sku: ''
        }
      ]
    }));
  };

  // Remove variant
  const removeVariant = (index) => {
    if (product.variants.length <= 1) return;
    const updatedVariants = [...product.variants];
    updatedVariants.splice(index, 1);
    setProduct(prev => ({ ...prev, variants: updatedVariants }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + product.images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    try {
      const uploadedImages = [];
      const newImageFiles = [];
      
      for (const file of files) {
        uploadedImages.push(URL.createObjectURL(file));
        newImageFiles.push(file);
      }
      
      setProduct(prev => ({ ...prev, images: [...prev.images, ...uploadedImages] }));
      setImageFiles(prev => [...prev, ...newImageFiles]);
    } catch (err) {
      setError('Error uploading images');
    }
  };

  // Remove image
  const removeImage = (index) => {
    const updatedImages = [...product.images];
    const updatedFiles = [...imageFiles];
    updatedImages.splice(index, 1);
    updatedFiles.splice(index, 1);
    setProduct(prev => ({ ...prev, images: updatedImages }));
    setImageFiles(updatedFiles);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!product.product_name.trim()) {
      setError('Product name is required');
      setLoading(false);
      return;
    }

    if (!product.brand.trim()) {
      setError('Brand is required');
      setLoading(false);
      return;
    }

    for (const variant of product.variants) {
      if (!variant.variant_value.trim()) {
        setError('Variant value is required for all variants');
        setLoading(false);
        return;
      }
      if (!variant.marked_price || parseFloat(variant.marked_price) <= 0) {
        setError('Marked price must be greater than 0');
        setLoading(false);
        return;
      }
      if (!variant.selling_price || parseFloat(variant.selling_price) <= 0) {
        setError('Selling price must be greater than 0');
        setLoading(false);
        return;
      }
      if (parseFloat(variant.selling_price) > parseFloat(variant.marked_price)) {
        setError('Selling price cannot be greater than marked price');
        setLoading(false);
        return;
      }
      if (!variant.stock_quantity || parseInt(variant.stock_quantity) < 0) {
        setError('Stock quantity must be 0 or greater');
        setLoading(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('productData', JSON.stringify({
        product_name: product.product_name,
        brand: product.brand,
        description: product.description,
        variants: product.variants.map(v => ({
          variant_name: v.variant_type, // Using variant_type as variant_name
          variant_value: v.variant_value,
          marked_price: v.marked_price,
          selling_price: v.selling_price,
          stock_quantity: v.stock_quantity,
          sku: v.sku
        }))
      }));

      // Append each image file
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.post('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      navigate(`/product/${response.data.productId}`);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Error creating product. Please check server logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar/>
      <div className="add-products-container">
        <h1 className="add-products-title">Add New Product</h1>
        
        {error && <div className="add-products-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="add-products-form">
          <div className="add-products-grid">
            {/* Column 1 - Basic Information */}
            <div className="add-products-section">
              <h2 className="add-products-section-title">Basic Information</h2>
              
              <div className="add-products-form-group">
                <label className="add-products-label">Product Name*</label>
                <input
                  type="text"
                  name="product_name"
                  value={product.product_name}
                  onChange={handleChange}
                  required
                  className="add-products-input"
                  placeholder="Enter product name"
                />
              </div>
              
              <div className="add-products-form-group">
                <label className="add-products-label">Brand*</label>
                <input
                  type="text"
                  name="brand"
                  value={product.brand}
                  onChange={handleChange}
                  required
                  className="add-products-input"
                  placeholder="Enter brand name"
                />
              </div>
              
              <div className="add-products-form-group">
                <label className="add-products-label">Description</label>
                <textarea
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  rows={4}
                  className="add-products-input add-products-textarea"
                  placeholder="Enter product description"
                />
              </div>
            </div>
            
            {/* Column 2 - Variants */}
            <div className="add-products-section">
              <div className="add-products-variant-header-container">
                <h2 className="add-products-section-title">Variants</h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="add-products-add-variant"
                  aria-label="Add variant"
                >
                  <FaPlus />
                </button>
              </div>
              
              {product.variants.map((variant, index) => (
                <div key={index} className="add-products-variant-container">
                  <div className="add-products-variant-header">
                    <h3 className="add-products-variant-title">Variant {index + 1}</h3>
                    {product.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="add-products-variant-remove"
                        aria-label="Remove variant"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  
                  <div className="add-products-form-group">
                    <label className="add-products-label">Variant Type*</label>
                    <select
                      name="variant_type"
                      value={variant.variant_type}
                      onChange={(e) => handleVariantChange(index, e)}
                      className="add-products-input"
                      required
                    >
                      {variantTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="add-products-form-group">
                    <label className="add-products-label">
                      {variant.variant_type === 'Size' ? 'Size (e.g., XL)' : 'Color (e.g., Red)'}*
                    </label>
                    <input
                      type="text"
                      name="variant_value"
                      value={variant.variant_value}
                      onChange={(e) => handleVariantChange(index, e)}
                      required
                      className="add-products-input"
                      placeholder={variant.variant_type === 'Size' ? 'e.g., XL' : 'e.g., Red'}
                    />
                  </div>
                  
                  <div className="add-products-form-group">
                    <label className="add-products-label">Marked Price*</label>
                    <input
                      type="number"
                      name="marked_price"
                      value={variant.marked_price}
                      onChange={(e) => handleVariantChange(index, e)}
                      min="0.01"
                      step="0.01"
                      required
                      className="add-products-input"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="add-products-form-group">
                    <label className="add-products-label">Selling Price*</label>
                    <input
                      type="number"
                      name="selling_price"
                      value={variant.selling_price}
                      onChange={(e) => handleVariantChange(index, e)}
                      min="0.01"
                      step="0.01"
                      required
                      className="add-products-input"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="add-products-form-group">
                    <label className="add-products-label">Stock Quantity*</label>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={variant.stock_quantity}
                      onChange={(e) => handleVariantChange(index, e)}
                      min="0"
                      required
                      className="add-products-input"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="add-products-form-group">
                    <label className="add-products-label">SKU (Optional)</label>
                    <input
                      type="text"
                      name="sku"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, e)}
                      className="add-products-input"
                      placeholder="Product SKU"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Column 3 - Images */}
            <div className="add-products-section">
              <h2 className="add-products-section-title">Images (Max 5)</h2>
              
              <div className="add-products-upload-area">
                <label htmlFor="product-images-upload">
                  <div className="add-products-upload-content">
                    <FaUpload className="add-products-upload-icon" />
                    <div className="add-products-upload-text">Click to upload images</div>
                    <div className="add-products-upload-hint">or drag and drop</div>
                  </div>
                  <input
                    id="product-images-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="add-products-file-input"
                  />
                </label>
              </div>
              
              <div className="add-products-image-grid">
                {product.images.map((img, index) => (
                  <div key={index} className="add-products-image-preview">
                    <img src={img} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="add-products-image-remove"
                      aria-label="Remove image"
                    >
                      <FaMinus size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="add-products-button-group">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="add-products-button add-products-button-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="add-products-button add-products-button-submit"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddProducts;