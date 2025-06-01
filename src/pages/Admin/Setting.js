import React from "react";
import Navbar from "./Navbar";
import "./setting.css";

function Settings() {
  return (
    <div className="settings-container">
      <Navbar />
      <div className="settings-content">
        <h1 className="settings-title">Settings</h1>

        <div className="settings-card">
          <h2 className="card-title">Profile Settings</h2>
          <div className="input-group">
            <label htmlFor="name">Admin Name</label>
            <input type="text" id="name" placeholder="Enter your name" />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" placeholder="admin@example.com" />
          </div>
          <button className="save-btn">Save Profile</button>
        </div>

        <div className="settings-card">
          <h2 className="card-title">System Preferences</h2>
          <div className="input-group">
            <label htmlFor="theme">Theme</label>
            <select id="theme">
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>
          <div className="input-group checkbox-group">
            <input type="checkbox" id="notify" />
            <label htmlFor="notify">Enable Email Notifications</label>
          </div>
          <button className="save-btn">Save Preferences</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
