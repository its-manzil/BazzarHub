import React, { useState, useRef } from 'react';
import axios from 'axios';
import './AddProducts.css';
import Navbar from '../Navbar';
const AddProducts = () => {
  const [formData, setFormData] = useState({
    productName: '',
    brand: '',
    category: '',
    description: '',
    images: [],
    variants: []
  });

  const [variantType, setVariantType] = useState('size');
  const [currentVariant, setCurrentVariant] = useState({
    type: 'size',
    value: '',
    markedPrice: '',
    sellingPrice: '', 
    stockQuantity: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const categories = [
    'Clothing', 'Electronics', 'Sports', 'Jewelry', 'Medicines',
    'Home & Kitchen', 'Beauty', 'Books', 'Toys', 'Automotive'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - formData.images.length);

    if (files.length + formData.images.length > 5) {
      setError('You can upload a maximum of 5 images');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleVariantTypeChange = (e) => {
    setVariantType(e.target.value);
    setCurrentVariant(prev => ({ ...prev, type: e.target.value, value: '' }));
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setCurrentVariant(prev => ({ ...prev, [name]: value }));
  };

  const addVariant = () => {
    if (!currentVariant.value || !currentVariant.markedPrice || !currentVariant.sellingPrice || !currentVariant.stockQuantity) {
      setError('Please fill all variant fields');
      return;
    }

    if (parseFloat(currentVariant.sellingPrice) > parseFloat(currentVariant.markedPrice)) {
      setError('Selling price cannot be higher than marked price');
      return;
    }

    const newVariant = {
      type: currentVariant.type,
      value: currentVariant.value,
      markedPrice: parseFloat(currentVariant.markedPrice),
      sellingPrice: parseFloat(currentVariant.sellingPrice),
      stockQuantity: parseInt(currentVariant.stockQuantity)
    };

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));

    setCurrentVariant({
      type: variantType,
      value: '',
      markedPrice: '',
      sellingPrice: '',
      stockQuantity: ''
    });

    setError('');
  };

  const removeVariant = (index) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.productName || !formData.brand || !formData.category || !formData.description) {
      setError('Please fill all required fields');
      setIsLoading(false);
      return;
    }

    if (formData.images.length === 0) {
      setError('Please upload at least one image');
      setIsLoading(false);
      return;
    }

    if (formData.variants.length === 0) {
      setError('Please add at least one variant');
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('productName', formData.productName);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);

      formData.images.forEach(image => {
        formDataToSend.append('images', image.file);
      });

      formDataToSend.append('variants', JSON.stringify(formData.variants));

      // Simplified request without token
      await axios.post('http://localhost:8099/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Product added successfully!');
      
      // Reset form
      setFormData({
        productName: '',
        brand: '',
        category: '',
        description: '',
        images: [],
        variants: []
      });
      
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.response?.data?.message || err.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
    <Navbar/>
      <div className="add-products-container">
        <h1 className="add-products-title">Add New Product</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="add-products-form">
        {/* Product Basic Information */}
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="form-textarea"
              required
            ></textarea>
          </div>
        </div>
        
        {/* Product Images */}
        <div className="form-section">
          <h2 className="section-title">Images</h2>
          <p className="section-description">Upload up to 5 images (first image will be the main image)</p>
          
          <div className="images-container">
            {formData.images.map((image, index) => (
              <div key={index} className="image-preview-container">
                <img 
                  src={image.preview} 
                  alt={`Preview ${index + 1}`} 
                  className="image-preview"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="remove-image-button"
                >
                  ×
                </button>
              </div>
            ))}
            
            {formData.images.length < 5 && (
              <div 
                className="image-upload-placeholder"
                onClick={() => fileInputRef.current.click()}
              >
                <span className="placeholder-icon">+</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden-file-input"
                  accept="image/*"
                  multiple
                />
              </div>
            )}
          </div>
          
          {formData.images.length < 5 && (
            <div className="upload-more-container">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="upload-more-button"
              >
                {formData.images.length === 0 ? 'Upload Images' : 'Upload More Images'}
              </button>
            </div>
          )}
        </div>
        
        {/* Product Variants */}
        <div className="form-section">
          <h2 className="section-title">Variants</h2>
          
          <div className="variants-container">
            {formData.variants.length > 0 && (
              <div className="variants-table-container">
                <table className="variants-table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Type</th>
                      <th className="table-header-cell">Value</th>
                      <th className="table-header-cell">Marked Price</th>
                      <th className="table-header-cell">Selling Price</th>
                      <th className="table-header-cell">Stock</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {formData.variants.map((variant, index) => (
                      <tr key={index} className="table-row">
                        <td className="table-cell capitalize">{variant.type}</td>
                        <td className="table-cell">{variant.value}</td>
                        <td className="table-cell">${variant.markedPrice.toFixed(2)}</td>
                        <td className="table-cell">${variant.sellingPrice.toFixed(2)}</td>
                        <td className="table-cell">{variant.stockQuantity}</td>
                        <td className="table-cell">
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="remove-variant-button"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="add-variant-container">
              <h3 className="add-variant-title">Add New Variant</h3>
              
              <div className="variant-input-grid">
                <div className="form-group">
                  <label className="form-label">Variant Type</label>
                  <select
                    value={variantType}
                    onChange={handleVariantTypeChange}
                    className="form-input"
                  >
                    <option value="size">Size</option>
                    <option value="color">Color</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    {variantType === 'size' ? 'Size' : 'Color'} *
                  </label>
                  <input
                    type="text"
                    name="value"
                    value={currentVariant.value}
                    onChange={handleVariantChange}
                    placeholder={variantType === 'size' ? 'e.g., XL, 10, etc.' : 'e.g., Red, Blue, etc.'}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="variant-price-grid">
                <div className="form-group">
                  <label className="form-label">Marked Price *</label>
                  <div className="price-input-container">
                    <span className="price-symbol">$</span>
                    <input
                      type="number"
                      name="markedPrice"
                      value={currentVariant.markedPrice}
                      onChange={handleVariantChange}
                      min="0"
                      step="0.01"
                      className="price-input"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Selling Price *</label>
                  <div className="price-input-container">
                    <span className="price-symbol">$</span>
                    <input
                      type="number"
                      name="sellingPrice"
                      value={currentVariant.sellingPrice}
                      onChange={handleVariantChange}
                      min="0"
                      step="0.01"
                      className="price-input"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={currentVariant.stockQuantity}
                    onChange={handleVariantChange}
                    min="0"
                    className="form-input"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={addVariant}
                className="add-variant-button"
              >
                Add Variant
              </button>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="submit-button-container">
          <button
            type="submit"
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default AddProducts;