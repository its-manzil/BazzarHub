import React, { useState, useRef } from 'react';
import axios from 'axios';
import './AddProducts.css';
const AddProducts = () => {
  // Form state
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

  // Category options
  const categories = [
    'Clothing',
    'Electronics',
    'Sports',
    'Jewelry',
    'Medicines',
    'Home & Kitchen',
    'Beauty',
    'Books',
    'Toys',
    'Automotive'
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
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

  // Remove an image
  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Handle variant type change
  const handleVariantTypeChange = (e) => {
    setVariantType(e.target.value);
    setCurrentVariant(prev => ({
      ...prev,
      type: e.target.value,
      value: ''
    }));
  };

  // Handle variant input changes
  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setCurrentVariant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a variant to the product
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

    // Reset current variant
    setCurrentVariant({
      type: variantType,
      value: '',
      markedPrice: '',
      sellingPrice: '',
      stockQuantity: ''
    });

    setError('');
  };

  // Remove a variant
  const removeVariant = (index) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      variants: newVariants
    }));
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
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
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append('productName', formData.productName);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      
      // Append images
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images`, image.file);
      });

      // Append variants as JSON string
      formDataToSend.append('variants', JSON.stringify(formData.variants));

      // Send to backend
      const response = await axios.post('/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
        </div>
        
        {/* Product Images */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Images</h2>
          <p className="text-sm text-gray-500 mb-4">Upload up to 5 images (first image will be the main image)</p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative">
                <img 
                  src={image.preview} 
                  alt={`Preview ${index + 1}`} 
                  className="w-24 h-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            
            {formData.images.length < 5 && (
              <div 
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                <span className="text-gray-400">+</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                  multiple
                />
              </div>
            )}
          </div>
          
          {formData.images.length < 5 && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {formData.images.length === 0 ? 'Upload Images' : 'Upload More Images'}
              </button>
            </div>
          )}
        </div>
        
        {/* Product Variants */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Variants</h2>
          
          <div className="space-y-4">
            {formData.variants.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marked Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.variants.map((variant, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{variant.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${variant.markedPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${variant.sellingPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.stockQuantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="text-red-600 hover:text-red-900"
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
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-md font-medium mb-3">Add New Variant</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variant Type</label>
                  <select
                    value={variantType}
                    onChange={handleVariantTypeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="size">Size</option>
                    <option value="color">Color</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {variantType === 'size' ? 'Size' : 'Color'} *
                  </label>
                  <input
                    type="text"
                    name="value"
                    value={currentVariant.value}
                    onChange={handleVariantChange}
                    placeholder={variantType === 'size' ? 'e.g., XL, 10, etc.' : 'e.g., Red, Blue, etc.'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marked Price *</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="markedPrice"
                      value={currentVariant.markedPrice}
                      onChange={handleVariantChange}
                      min="0"
                      step="0.01"
                      className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="sellingPrice"
                      value={currentVariant.sellingPrice}
                      onChange={handleVariantChange}
                      min="0"
                      step="0.01"
                      className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={currentVariant.stockQuantity}
                    onChange={handleVariantChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Variant
              </button>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProducts;