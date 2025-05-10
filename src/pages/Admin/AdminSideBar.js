import React from 'react';
import Logo from '../Customers/Logo';
import './adminsidebar.css';

function AdminSideBar() {
  return (
    <aside className="admin-sidebar">
      <Logo />
      <nav className="sidebar-nav">
        <a href="/AdminDashboard">Dashboard</a>
        <a href="/Products">Products</a>
        <a href="/Categories">Categories</a>
        <a href="/Orders">Orders</a>
        <a href="/Reports">Reports</a>
        <a href="/ContactMessages">Customer Feedback</a>
        <a href="/Settings">Settings</a>
      </nav>
    </aside>
  );
}

export default AdminSideBar;
