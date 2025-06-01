import React from "react";
import Navbar from "./Navbar";
import "./adminDashboard.css";
import { FaBox, FaUsers, FaShoppingCart, FaRupeeSign } from "react-icons/fa";

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <Navbar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>BazaarHub Dashboard</h1>
        </header>

        <section className="stats-section">
          <div className="stat-card">
            <FaRupeeSign className="stat-icon" />
            <div>
              <h3>Total Sales</h3>
              <p>₹2,40,000</p>
            </div>
          </div>
          <div className="stat-card">
            <FaShoppingCart className="stat-icon" />
            <div>
              <h3>Orders</h3>
              <p>320</p>
            </div>
          </div>
          <div className="stat-card">
            <FaBox className="stat-icon" />
            <div>
              <h3>Products</h3>
              <p>85</p>
            </div>
          </div>
          <div className="stat-card">
            <FaUsers className="stat-icon" />
            <div>
              <h3>Customers</h3>
              <p>120</p>
            </div>
          </div>
        </section>

        <section className="orders-section">
          <h2>Recent Orders</h2>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#2345</td>
                <td>Rahul Sharma</td>
                <td>₹3,200</td>
                <td className="status delivered">Delivered</td>
                <td>2025-05-28</td>
              </tr>
              <tr>
                <td>#2346</td>
                <td>Anjali Verma</td>
                <td>₹1,500</td>
                <td className="status pending">Pending</td>
                <td>2025-05-29</td>
              </tr>
              <tr>
                <td>#2347</td>
                <td>Mohit Kumar</td>
                <td>₹2,000</td>
                <td className="status failed">Failed</td>
                <td>2025-05-30</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
