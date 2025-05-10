import React, { useState } from 'react';
import './categories.css';
import AdminSideBar from './AdminSideBar';

function Categories() {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Electronics', count: 12 },
    { id: 2, name: 'Clothing', count: 8 },
  ]);
  const [categoryName, setCategoryName] = useState('');

  const handleAdd = () => {
    setCategoryName('');
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setCategoryName(category.name);
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleSave = () => {
    if (editingCategory) {
      setCategories(categories.map(cat =>
        cat.id === editingCategory.id ? { ...cat, name: categoryName } : cat
      ));
    } else {
      setCategories([...categories, {
        id: categories.length + 1,
        name: categoryName,
        count: 0,
      }]);
    }
    setShowModal(false);
  };

  return (
    <div className="admin-page-layout">
      <AdminSideBar />
      <div className="admin-category">
        <h1 className="category-title">Manage Categories</h1>
        <p className="category-subtext">
          Add, edit, or delete product categories.
        </p>

        <div className="category-actions">
          <button className="btn-add" onClick={handleAdd}>Add New Category</button>
        </div>

        <table className="category-table">
          <thead>
            <tr>
              <th>S.N.</th>
              <th>Category Name</th>
              <th>Products Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={cat.id}>
                <td>{index + 1}</td>
                <td>{cat.name}</td>
                <td>{cat.count}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(cat)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(cat.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <input
                className="modal-input"
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category Name"
              />
              <div className="modal-buttons">
                <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-save" onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Categories;
