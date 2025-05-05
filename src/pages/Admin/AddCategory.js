import React from "react";
import "./admin.css";

export default function AddCategory() {
  return (
    <div className="admin-form-wrapper">
      <h1 className="admin-heading">Add New Category</h1>
      <form className="admin-form">
        <div className="input-group">
          <label>Category Name</label>
          <input type="text" />
        </div>
        <button className="submit-btn">Add Category</button>
      </form>
    </div>
  );
}
