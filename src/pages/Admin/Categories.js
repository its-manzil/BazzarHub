import React from 'react';
import './categories.css';

function Categories() {
  return (
    <div className="admin-categories">
      <h1 className="categories-title">Manage Categories</h1>
      <p className="categories-subtext">
        View existing categories or create new ones to organize your store.
      </p>

      <div className="categories-actions">
        <button className="btn-add">Add New Category</button>
      </div>

      <div className="categories-list">
        <div className="category-card">
          <h3>Electronics</h3>
          <p>Items: 42</p>
          <button className="btn-edit">Edit</button>
        </div>
        {/* Add more category cards dynamically */}
      </div>
    </div>
  );
}

export default Categories;
