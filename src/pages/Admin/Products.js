import React from 'react';
import './products.css';
import AdminSideBar from './AdminSideBar';

function Products() {
  return (
    <>
    <div className="admin-page-layout">
      <AdminSideBar />
      <div className="admin-products">
        <h1 className="products-title" >Manage Products</h1>
        <p className="products-subtext">
          View, edit, or add new products to your store.
        </p>

        <div className="products-actions">
          <button className="btn-add">Add New Product</button>
        </div>

        <div className="products-list">
          <div className="product-card">
            <h3>Product Name</h3>
            <p>Category: Electronics</p>
            <p>Price: $299</p>
            <button className="btn-edit">Edit</button>
          </div>
          {/* Add more product cards dynamically later */}
        </div>
      </div>
    </div>
    </>
  );
}

export default Products;
