// src/pages/Admin/ManageCategories.js

import React from "react";
import "./admin.css";

export default function ManageCategories() {
  return (
    <div className="admin-form-wrapper">
      <h1 className="admin-heading">Manage Categories</h1>

      <div className="admin-list">
        {/* Example Category */}
        <div className="admin-item">
          <div>
            <strong>Fruits</strong>
            <p>Fresh and organic fruits</p>
          </div>
          <div className="admin-actions">
            <button className="edit-btn">Edit</button>
            <button className="delete-btn">Delete</button>
          </div>
        </div>

        {/* More categories can be mapped here dynamically */}
      </div>
    </div>
  );
}
