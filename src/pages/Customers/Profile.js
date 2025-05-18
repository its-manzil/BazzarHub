import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import Nav from './Nav';
import Logo from "./Logo";
import CartLogo from './CartLogo';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const userId = localStorage.getItem('userId');
        
        const response = await fetch(`http://localhost:8080/api/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            navigate('/login');
            return;
          }
          throw new Error(data.message || 'Failed to fetch profile');
        }

        setUser(data.user);
      } catch (err) {
        setError(err.message);
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/')}>Go to Home</button>
      </div>
    );
  }

  return (
    <>
      <Nav />
      <Logo />
      <CartLogo />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h2>My Profile</h2>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
          
          {user && (
            <div className="profile-content">
              <div className="profile-picture-container">
                {user.profile_picture ? (
                  <img 
                    src={`http://localhost:8080/uploads/${user.profile_picture}`} 
                    alt="Profile" 
                    className="profile-picture"
                  />
                ) : (
                  <div className="profile-picture-placeholder">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-label">Full Name:</span>
                  <span className="detail-value">{user.full_name}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Username:</span>
                  <span className="detail-value">@{user.username}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{user.phone}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Member Since:</span>
                  <span className="detail-value">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="profile-actions">
            <button 
              onClick={() => navigate(`/edit-profile/${user?.id}`)}
              className="edit-profile-btn"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;