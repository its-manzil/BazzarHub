import React from 'react';
import AdminSideBar from './AdminSideBar';
import './settings.css';

function Settings() {
  return (
    <div className="admin-layout">
      <AdminSideBar />

      <main className="admin-main">
        <header className="admin-settings-header">
          <h1>Admin Settings</h1>
        </header>

        <section className="settings-section">
          {/* Profile Settings */}
          <div className="settings-card">
            <h2 className="section-title">Profile Information</h2>
            <form className="settings-form">
              <label>
                Full Name:
                <input type="text" placeholder="Admin Name" />
              </label>
              <label>
                Email:
                <input type="email" placeholder="admin@example.com" />
              </label>
              <button type="submit" className="save-button">Update Profile</button>
            </form>
          </div>

          {/* Password Settings */}
          <div className="settings-card">
            <h2 className="section-title">Change Password</h2>
            <form className="settings-form">
              <label>
                Current Password:
                <input type="password" />
              </label>
              <label>
                New Password:
                <input type="password" />
              </label>
              <label>
                Confirm Password:
                <input type="password" />
              </label>
              <button type="submit" className="save-button">Change Password</button>
            </form>
          </div>

          {/* Notification Settings */}
          <div className="settings-card">
            <h2 className="section-title">Notifications</h2>
            <form className="settings-form">
              <label>
                <input type="checkbox" defaultChecked />
                Email me about new orders
              </label>
              <label>
                <input type="checkbox" />
                Weekly reports
              </label>
              <button type="submit" className="save-button">Update Preferences</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;
