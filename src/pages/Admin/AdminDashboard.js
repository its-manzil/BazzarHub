import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenue: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // API calls — replace with actual backend endpoints
        const productsRes = await axios.get('http://localhost:8099/api/products/count');
        const ordersRes = await axios.get('http://localhost:8099/api/orders/recent');
        const customersRes = await axios.get('http://localhost:8099/api/customers/count');
        const revenueRes = await axios.get('http://localhost:8099/api/orders/revenue');

        setStats({
          totalProducts: productsRes.data.count,
          totalOrders: ordersRes.data.totalOrders,
          totalCustomers: customersRes.data.count,
          revenue: revenueRes.data.totalRevenue
        });

        setRecentOrders(ordersRes.data.recent || []);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <Navbar />
      <div className="admin-dashboard-container">
        <header className="admin-dashboard-header">
          <h1 className="admin-dashboard-title">Admin Dashboard</h1>
          <p className="admin-dashboard-subtitle">
            Overview of your store's performance and recent activities
          </p>
        </header>

        {error && <div className="admin-dashboard-alert error">{error}</div>}

        {/* Stats Cards */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>Total Products</h3>
            <p>{stats.totalProducts}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Total Customers</h3>
            <p>{stats.totalCustomers}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Revenue</h3>
            <p>Rs.{stats.revenue.toLocaleString()}</p>
          </div>
        </section>

        {/* Recent Orders Table */}
        <section className="admin-recent-orders-section">
          <h2>Recent Orders</h2>
          {loading ? (
            <p>Loading recent orders...</p>
          ) : recentOrders.length === 0 ? (
            <p>No recent orders found.</p>
          ) : (
            <table className="admin-recent-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customerName}</td>
                    <td>Rs.{order.total}</td>
                    <td className={`status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
};

export default AdminDashboard;
