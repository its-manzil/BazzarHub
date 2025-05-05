import React from 'react';
import './settings.css';
import AdminSideBar from './AdminSideBar';

function Settings() {
  return (
    <>
    <AdminSideBar/>
    <div className="admin-settings">
      <h1 className="settings-title">Store Settings</h1>
      <p className="settings-subtext">
        Configure your store preferences, profile, and system settings.
      </p>

      <form className="settings-form">
        <div className="form-group">
          <label htmlFor="storeName">Store Name</label>
          <input type="text" id="storeName" placeholder="Enter store name" />
        </div>

        <div className="form-group">
          <label htmlFor="email">Admin Email</label>
          <input type="email" id="email" placeholder="admin@example.com" />
        </div>

        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <select id="currency">
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="NPR">Rs NPR</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="timezone">Timezone</label>
          <input type="text" id="timezone" placeholder="e.g. GMT+5:45" />
        </div>

        <button type="submit" className="save-btn">Save Settings</button>
      </form>
    </div>
    </>
  );
}

export default Settings;
