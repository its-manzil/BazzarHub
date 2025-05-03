import React from "react";
import "./profile.css";
import Nav from './Nav';
import Logo from "./Logo";
import CartLogo from "./CartLogo";
export default function Profile() {
  // Static user data (can be replaced with dynamic user data later)
  const user = {
    name: "Abiral Acharya",
    email: "abiral@example.com",
    phone: "+977 98XXXXXXXX",
    address: "Jhapa, Nepal",
    joined: "Jan 2024",
    profileImage: "./images/profile-placeholder.png",
  };

  return (
    <>
    <Nav/>
    <Logo/>
    <CartLogo/>
    <div className="profile-container">
      <h2 className="profile-title">My Profile</h2>
      <div className="profile-card">
        <div className="profile-image-section">
          <img
            src={user.profileImage}
            alt="User Profile"
            className="profile-image"
          />
        </div>
        <div className="profile-details">
          <h3>{user.name}</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Address:</strong> {user.address}</p>
          <p><strong>Joined:</strong> {user.joined}</p>
        </div>
      </div>
    </div>
    </>
  );
}
