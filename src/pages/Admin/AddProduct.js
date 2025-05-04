import React from "react";
import "./admin.css";

export default function AddProduct() {
  return (
    <div className="admin-form-wrapper">
      <h1 className="admin-heading">Add New Product</h1>
      <form className="admin-form">
        <div className="input-group">
          <label>Product Name</label>
          <input type="text" />
        </div>
        <div className="input-group">
          <label>Description</label>
          <textarea rows="4"></textarea>
        </div>
        <div className="input-group">
          <label>Price</label>
          <input type="number" />
        </div>
        <div className="input-group">
          <label>Category</label>
          <input type="text" />
        </div>
        <button className="submit-btn">Add Product</button>
      </form>
    </div>
  );
}
