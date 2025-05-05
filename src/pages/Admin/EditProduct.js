import React from "react";
import "./admin.css";

export default function EditProduct() {
  return (
    <div className="admin-form-wrapper">
      <h1 className="admin-heading">Edit Product</h1>
      <form className="admin-form">
        <div className="input-group">
          <label>Product Name</label>
          <input type="text" value="Sample Product" />
        </div>
        <div className="input-group">
          <label>Description</label>
          <textarea rows="4">Sample description</textarea>
        </div>
        <div className="input-group">
          <label>Price</label>
          <input type="number" value="20" />
        </div>
        <button className="submit-btn">Update Product</button>
      </form>
    </div>
  );
}
