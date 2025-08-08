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

      await axios.post('http://localhost:8099/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Product added successfully!');
      
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
      <div className="product-creation-portal">
        <div className="portal-container">
          <header className="portal-header">
            <h1 className="portal-title">
              <span className="title-gradient">Create New Product</span>
              <span className="title-underline"></span>
            </h1>
            <p className="portal-subtitle">Fill out the form below to add a new product to your inventory</p>
          </header>
          
          {error && (
            <div className="portal-alert error">
              <svg className="alert-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" />
              </svg>
              {error}
            </div>
          )}
          
          {success && (
            <div className="portal-alert success">
              <svg className="alert-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
              </svg>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="product-creation-form">
            {/* Basic Information Section */}
            <fieldset className="form-section">
              <legend className="section-legend">
                <span className="legend-icon">1</span>
                Basic Information
              </legend>
              
              <div className="form-grid">
                <div className="form-fieldset">
                  <label htmlFor="productName" className="fieldset-label">Product Name</label>
                  <input
                    id="productName"
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    className="fieldset-input"
                    required
                  />
                  <div className="fieldset-focus"></div>
                </div>
                
                <div className="form-fieldset">
                  <label htmlFor="brand" className="fieldset-label">Brand</label>
                  <input
                    id="brand"
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="fieldset-input"
                    required
                  />
                  <div className="fieldset-focus"></div>
                </div>
                
                <div className="form-fieldset">
                  <label htmlFor="category" className="fieldset-label">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="fieldset-input"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="fieldset-focus"></div>
                </div>
              </div>
              
              <div className="form-fieldset">
                <label htmlFor="description" className="fieldset-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="fieldset-textarea"
                  required
                ></textarea>
                <div className="fieldset-focus"></div>
              </div>
            </fieldset>
            
            {/* Images Section */}
            <fieldset className="form-section">
              <legend className="section-legend">
                <span className="legend-icon">2</span>
                Product Images
              </legend>
              
              <p className="section-description">Upload up to 5 images (first image will be the main image)</p>
              
              <div className="image-upload-grid">
                {formData.images.map((image, index) => (
                  <div key={index} className="image-card">
                    <div className="image-card-inner">
                      <img 
                        src={image.preview} 
                        alt={`Preview ${index + 1}`} 
                        className="uploaded-image"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="image-remove-btn"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <svg viewBox="0 0 24 24" className="remove-icon">
                          <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                {formData.images.length < 5 && (
                  <div className="upload-card">
                    <div 
                      className="upload-area"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <svg className="upload-icon" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        <path fill="currentColor" d="M8,15V17H16V15H8M8,11V13H16V11H8M8,7V9H16V7H8Z" />
                      </svg>
                      <span className="upload-text">Click to upload</span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden-file-input"
                        accept="image/*"
                        multiple
                      />
                    </div>
                  </div>
                )}
              </div>
            </fieldset>
            
            {/* Variants Section */}
            <fieldset className="form-section">
              <legend className="section-legend">
                <span className="legend-icon">3</span>
                Product Variants
              </legend>
              
              {formData.variants.length > 0 && (
                <div className="variant-table-container">
                  <table className="variant-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Marked Price</th>
                        <th>Selling Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.variants.map((variant, index) => (
                        <tr key={index}>
                          <td className="capitalize">{variant.type}</td>
                          <td>{variant.value}</td>
                          <td>Rs.{variant.markedPrice.toFixed(2)}</td>
                          <td>Rs.{variant.sellingPrice.toFixed(2)}</td>
                          <td>{variant.stockQuantity}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="variant-remove-btn"
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
              
              <div className="variant-creator">
                <h3 className="variant-creator-title">Add New Variant</h3>
                
                <div className="variant-form-grid">
                  <div className="form-fieldset">
                    <label htmlFor="variantType" className="fieldset-label">Variant Type</label>
                    <select
                      id="variantType"
                      value={variantType}
                      onChange={handleVariantTypeChange}
                      className="fieldset-input"
                    >
                      <option value="size">Size</option>
                      <option value="color">Color</option>
                    </select>
                    <div className="fieldset-focus"></div>
                  </div>
                  
                  <div className="form-fieldset">
                    <label htmlFor="variantValue" className="fieldset-label">
                      {variantType === 'size' ? 'Size' : 'Color'}
                    </label>
                    <input
                      id="variantValue"
                      type="text"
                      name="value"
                      value={currentVariant.value}
                      onChange={handleVariantChange}
                      placeholder={variantType === 'size' ? 'e.g., XL, 10, etc.' : 'e.g., Red, Blue, etc.'}
                      className="fieldset-input"
                    />
                    <div className="fieldset-focus"></div>
                  </div>
                </div>
                
                <div className="variant-price-grid">
                  <div className="form-fieldset">
                    <label htmlFor="markedPrice" className="fieldset-label">Marked Price</label>
                    <div className="price-input-container">
                      <span className="price-symbol">Rs.</span>
                      <input
                        id="markedPrice"
                        type="number"
                        name="markedPrice"
                        value={currentVariant.markedPrice}
                        onChange={handleVariantChange}
                        min="0"
                        step="0.01"
                        className="fieldset-input price-input"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="fieldset-focus"></div>
                  </div>
                  
                  <div className="form-fieldset">
                    <label htmlFor="sellingPrice" className="fieldset-label">Selling Price</label>
                    <div className="price-input-container">
                      <span className="price-symbol">Rs.</span>
                      <input
                        id="sellingPrice"
                        type="number"
                        name="sellingPrice"
                        value={currentVariant.sellingPrice}
                        onChange={handleVariantChange}
                        min="0"
                        step="0.01"
                        className="fieldset-input price-input"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="fieldset-focus"></div>
                  </div>
                  
                  <div className="form-fieldset">
                    <label htmlFor="stockQuantity" className="fieldset-label">Stock Quantity</label>
                    <input
                      id="stockQuantity"
                      type="number"
                      name="stockQuantity"
                      value={currentVariant.stockQuantity}
                      onChange={handleVariantChange}
                      min="0"
                      className="fieldset-input"
                    />
                    <div className="fieldset-focus"></div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={addVariant}
                  className="variant-add-btn"
                >
                  <svg className="btn-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                  </svg>
                  Add Variant
                </button>
              </div>
            </fieldset>
            
            {/* Form Submission */}
            <div className="form-submit-section">
              <button
                type="submit"
                disabled={isLoading}
                className="submit-product-btn"
              >
                {isLoading ? (
                  <>
                    <span className="submit-spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="submit-icon" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                    </svg>
                    Create Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddProducts;