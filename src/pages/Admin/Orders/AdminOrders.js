import React, { useState, useEffect } from 'react';
import './AdminOrders.css';
import Navbar from '../Navbar';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Pending');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:8099/api/allOrders');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8099/api/allOrders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      setOrders(prev => prev.map(order => 
        order.order_id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  const statuses = [
    'Pending', 
    'Processing', 
    'Shipped', 
    'Delivered', 
    'Cancelled', 
    'Returned'
  ];

  const renderStatusButtons = (order) => {
    switch (order.status) {
      case 'Pending':
        return (
          <div className="action-buttons">
            <button 
              className="status-btn processing" 
              onClick={() => updateOrderStatus(order.order_id, 'Processing')}
            >
              Process
            </button>
            <button 
              className="status-btn cancel" 
              onClick={() => updateOrderStatus(order.order_id, 'Cancelled')}
            >
              Cancel
            </button>
          </div>
        );
      case 'Processing':
        return (
          <div className="action-buttons">
            <button 
              className="status-btn shipped" 
              onClick={() => updateOrderStatus(order.order_id, 'Shipped')}
            >
              Ship
            </button>
          </div>
        );
      case 'Shipped':
        return (
          <div className="action-buttons">
            <button 
              className="status-btn delivered" 
              onClick={() => updateOrderStatus(order.order_id, 'Delivered')}
            >
              Deliver
            </button>
            <button 
              className="status-btn returned" 
              onClick={() => updateOrderStatus(order.order_id, 'Returned')}
            >
              Return
            </button>
          </div>
        );
      default:
        return <span className={`status-label ${order.status.toLowerCase()}`}>{order.status}</span>;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <>
    <Navbar/>
    <div className="admin-orders-container">
      <div className="admin-orders-header">
        <h1>Orders Management</h1>
        <div className="order-stats">
          <div className="stat-card total">
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>
          {statuses.map(status => (
            <div 
              key={status} 
              className={`stat-card ${status.toLowerCase()} ${activeTab === status ? 'active' : ''}`}
              onClick={() => setActiveTab(status)}
            >
              <span>{status}</span>
              <strong>{getOrdersByStatus(status).length}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="orders-tab-content">
        <div className="orders-table-container">
          {getOrdersByStatus(activeTab).length > 0 ? (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getOrdersByStatus(activeTab).map(order => (
                  <tr key={order.order_id}>
                    <td className="order-id">#{order.order_id}</td>
                    <td className="customer-info">
                      <div className="customer-name">{order.user_details?.full_name || 'Unknown Customer'}</div>
                      <div className="customer-email">{order.user_details?.email || ''}</div>
                    </td>
                    <td className="order-date">{formatDate(order.created_at)}</td>
                    <td className="order-items">
                      <div className="items-list">
                        {order.items.map(item => (
                          <div key={item.order_item_id} className="item">
                            {item.quantity}x {item.product_name} ({item.variant_value})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="order-total">Rs.{(Number(order.total_amount) || 0).toFixed(2)}</td>
                    <td className="payment-method">{order.payment_method}</td>
                    <td className="order-status">
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="order-actions">
                      {renderStatusButtons(order)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-orders-message">
              No {activeTab.toLowerCase()} orders found
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminOrders;