import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerNav.css';
import Nav from '../Nav';
const CustomerNav = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const userId = localStorage.getItem('userId');
        
        // Fetch user profile
        const profileResponse = await fetch(`http://localhost:8099/api/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const profileData = await profileResponse.json();
        
        if (!profileResponse.ok) {
          if (profileResponse.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            navigate('/login');
            return;
          }
          throw new Error(profileData.message || 'Failed to fetch profile');
        }

        setUser(profileData.user);
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="customer-nav-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !user) {
    return null; // Don't render nav if there's an error or no user
  }

  return (
    <>
    <div className="customer-nav">
      <div className="customer-nav-header">
        {user.profile_picture ? (
          <img 
            src={`http://localhost:8099/uploads/${user.profile_picture}`} 
            alt="Profile" 
            className="customer-nav-profile-pic"
          />
        ) : (
          <div className="customer-nav-profile-pic placeholder">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
        )}
        <h3>{user.full_name}</h3>
        <p>@{user.username}</p>
      </div>
      
      <nav className="customer-nav-menu">
        <button 
          className="customer-nav-btn"
          onClick={() => navigate('/dashboard')}
        >
          <i className="fas fa-tachometer-alt"></i> Dashboard
        </button>
        
        <button 
          className="customer-nav-btn"
          onClick={() => navigate('/cart')}
        >
          <i className="fas fa-shopping-cart"></i> Cart
        </button>
        
        <button 
          className="customer-nav-btn"
          onClick={() => navigate('/profile')}
        >
          <i className="fas fa-user"></i> Profile
        </button>
        
        <button 
          className="customer-nav-btn"
          onClick={() => navigate('/orders')}
        >
          <i className="fas fa-history"></i> Order History
        </button>
        
        <button 
          className="customer-nav-btn"
          onClick={() => navigate('/settings')}
        >
          <i className="fas fa-cog"></i> Settings
        </button>
        
        <button 
          className="customer-nav-btn logout-btn"
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </nav>
    </div>
    <Nav/>
    </>
  );
};

export default CustomerNav;