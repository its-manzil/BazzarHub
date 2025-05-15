import React, { useState } from 'react';
import './stock.css';
import AdminSideBar from './AdminSideBar';

function Stock() {
  const [stocks, setStocks] = useState([
    { id: 1, name: 'T-Shirt', quantity: 50, price: 20 },
    { id: 2, name: 'Jeans', quantity: 30, price: 40 },
  ]);

  const [newStock, setNewStock] = useState({ name: '', quantity: '', price: '' });
  const [editingStock, setEditingStock] = useState(null);

  const handleInputChange = (e) => {
    setNewStock({ ...newStock, [e.target.name]: e.target.value });
  };

  const handleAddStock = () => {
    if (!newStock.name || !newStock.quantity || !newStock.price) return;

    const newItem = {
      id: Date.now(),
      name: newStock.name,
      quantity: parseInt(newStock.quantity),
      price: parseFloat(newStock.price),
    };

    setStocks([...stocks, newItem]);
    setNewStock({ name: '', quantity: '', price: '' });
  };

  const handleEdit = (stock) => {
    setEditingStock(stock);
  };

  const handleUpdateStock = () => {
    setStocks(
      stocks.map((item) =>
        item.id === editingStock.id ? editingStock : item
      )
    );
    setEditingStock(null);
  };

  const handleDelete = (id) => {
    setStocks(stocks.filter((item) => item.id !== id));
  };

  return (
    <div className="admin-page-layout">
      <AdminSideBar />
      <div className="admin-stock">
        <h1 className="stock-title">Manage Stock</h1>
        <p className="stock-subtext">Add, update, or delete product inventory.</p>

        <div className="stock-form">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={newStock.name}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={newStock.quantity}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={newStock.price}
            onChange={handleInputChange}
          />
          <button className="btn-add" onClick={handleAddStock}>Add Stock</button>
        </div>

        <table className="stock-table">
          <thead>
            <tr>
              <th>S.N.</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price ($)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.price.toFixed(2)}</td>
                <td>
                  <button className="btn-view" onClick={() => handleEdit(item)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editingStock && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Edit Stock</h2>
              <input
                type="text"
                value={editingStock.name}
                onChange={(e) => setEditingStock({ ...editingStock, name: e.target.value })}
              />
              <input
                type="number"
                value={editingStock.quantity}
                onChange={(e) => setEditingStock({ ...editingStock, quantity: parseInt(e.target.value) })}
              />
              <input
                type="number"
                value={editingStock.price}
                onChange={(e) => setEditingStock({ ...editingStock, price: parseFloat(e.target.value) })}
              />
              <div className="modal-buttons">
                <button onClick={handleUpdateStock} className="btn-update">Update</button>
                <button onClick={() => setEditingStock(null)} className="btn-cancel">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Stock;
