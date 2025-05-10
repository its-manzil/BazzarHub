import React, { useState } from 'react';
import './orders.css';
import AdminSideBar from './AdminSideBar';

function Orders() {
  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: 'John Doe',
      items: 3,
      total: 120.5,
      status: 'Pending',
    },
    {
      id: 2,
      customer: 'Jane Smith',
      items: 1,
      total: 49.99,
      status: 'Shipped',
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleView = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleStatusChange = (e) => {
    const updatedOrders = orders.map((order) =>
      order.id === selectedOrder.id
        ? { ...order, status: e.target.value }
        : order
    );
    setOrders(updatedOrders);
    setSelectedOrder({ ...selectedOrder, status: e.target.value });
  };

  const handleDelete = (id) => {
    setOrders(orders.filter((order) => order.id !== id));
  };

  return (
    <div className="admin-page-layout">
      <AdminSideBar />
      <div className="admin-orders">
        <h1 className="orders-title">Manage Orders</h1>
        <p className="orders-subtext">
          View, manage, and update orders placed by customers.
        </p>

        <table className="orders-table">
          <thead>
            <tr>
              <th>S.N.</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id}>
                <td>{index + 1}</td>
                <td>{order.customer}</td>
                <td>{order.items}</td>
                <td>${order.total.toFixed(2)}</td>
                <td>{order.status}</td>
                <td>
                  <button className="btn-view" onClick={() => handleView(order)}>View</button>
                  <button className="btn-delete" onClick={() => handleDelete(order.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && selectedOrder && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Order Details</h2>
              <p><strong>Customer:</strong> {selectedOrder.customer}</p>
              <p><strong>Items:</strong> {selectedOrder.items}</p>
              <p><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
              <label>
                <strong>Status:</strong>
                <select
                  className="modal-input"
                  value={selectedOrder.status}
                  onChange={handleStatusChange}
                >
                  <option>Pending</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </label>

              <div className="modal-buttons">
                <button className="btn-cancel" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
