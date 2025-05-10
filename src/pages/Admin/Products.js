import React, { useState } from 'react';
import './products.css';
import AdminSideBar from './AdminSideBar';

function Products() {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    category: '',
    price: '',
    image: '',
  });

  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Product Name',
      category: 'Electronics',
      price: '299',
      image: './images/home1.jpg',
    },
    // Add more products here
  ]);

  const openAddModal = () => {
    setProductData({ name: '', category: '', price: '', image: '' });
    setIsEditMode(false);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setProductData(product);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      const imageUrl = file ? URL.createObjectURL(file) : '';
      setProductData({ ...productData, image: imageUrl });
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };

  const handleSave = () => {
    if (isEditMode) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productData.id ? { ...productData } : p
        )
      );
    } else {
      const newProduct = {
        ...productData,
        id: Date.now(),
      };
      setProducts([...products, newProduct]);
    }
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="admin-page-layout">
        <AdminSideBar />
        <div className="admin-products">
          <h1 className="products-title">Manage Products</h1>
          <p className="products-subtext">
            View, edit, or add new products to your store.
          </p>

          <div className="products-actions">
            <button className="btn-add" onClick={openAddModal}>
              Add New Product
            </button>
          </div>

          <div className="products-list">
            {products.map((product) => (
              <div className="product-card" key={product.id}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                />
                <h3>{product.name}</h3>
                <p>Category: {product.category}</p>
                <p>Price: ${product.price}</p>
                <button
                  className="btn-edit"
                  onClick={() => openEditModal(product)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
            <input
              className="modal-input"
              type="text"
              name="name"
              placeholder="Product Name"
              value={productData.name}
              onChange={handleInputChange}
            />
            <input
              className="modal-input"
              type="text"
              name="category"
              placeholder="Category"
              value={productData.category}
              onChange={handleInputChange}
            />
            <input
              className="modal-input"
              type="number"
              name="price"
              placeholder="Price"
              value={productData.price}
              onChange={handleInputChange}
            />
            <input
              className="modal-input"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleInputChange}
            />
            {productData.image && (
              <img
                src={productData.image}
                alt="Preview"
                style={{ width: '100%', marginTop: '10px', borderRadius: '8px' }}
              />
            )}
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Products;
