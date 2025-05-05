import React from 'react';
import Nav from '../../pages/Customers/Nav';
import Logo from '../../pages/Customers/Logo';
import CartLogo from '../../pages/Customers/CartLogo';
import './admin.css';

function AdminDashboard() {
  return (
    <>
      <Nav />
      <Logo />
      <CartLogo />

      <h1 className="about-heading">Admin Dashboard</h1>
      <section className="split-hero">
        <div className="hero-text">
          <h1>
            Welcome, <span className="highlight">Admin</span>
          </h1>
          <p>
            From here, manage your BazaarHub store by adding categories, products, and maintaining the latest inventory.
          </p>
          <p className="secondary-text">
            Use the navigation to add or edit product details, update categories, and keep your marketplace thriving.
          </p>
        </div>
        <div className="hero-image">
          <img src="/images/admin-panel.png" alt="Admin Panel" height={400} width={350} />
        </div>
      </section>
    </>
  );
}

export default AdminDashboard;
