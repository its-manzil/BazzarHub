import React from 'react';
import AdminSideBar from './AdminSideBar';
import './admindashboard.css';

function AdminDashboard() {
  return (
    <div className="admin-layout">
      <AdminSideBar />

      <main className="admin-main">
        <header className="admin-header">
          {/* You can add a search bar or notifications later */}
        </header>

        <section className="dashboard-overview">
          <h1 className="dashboard-title">Welcome, Admin 👋</h1>
          <p className="dashboard-subtext">Manage your BazaarHub store efficiently.</p>

          <div className="dashboard-cards">
            <div className="card">
              <h3>Total Orders</h3>
              <p>1,234</p>
            </div>
            <div className="card">
              <h3>Total Revenue</h3>
              <p>Rs. 8</p>
            </div>
            <div className="card">
              <h3>Products Listed</h3>
              <p>342</p>
            </div>
            <div className="card">
              <h3>Pending Shipments</h3>
              <p>27</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
