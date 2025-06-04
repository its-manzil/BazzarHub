import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerProfile.css';
import CustomerNav from './CustomerNav';
import { motion } from 'framer-motion';

const CustomerProfile = () => {
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
        const profileResponse = await fetch(`http://localhost:8099/api/profile/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
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

  if (loading) {
    return (
      <motion.div 
        className="loading-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="error-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/')}>Go to Home</button>
      </motion.div>
    );
  }

  return (
    <>
      <CustomerNav />
      <motion.div 
        className="profile-display-area"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-display-container">
          <motion.div 
            className="profile-header"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1>Your Profile</h1>
            <p className="welcome-message">Welcome back, {user.full_name}!</p>
          </motion.div>

          <div className="profile-content">
            <motion.div 
              className="profile-picture-container"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              {user.profile_picture ? (
                <img 
                  src={`http://localhost:8099/uploads/${user.profile_picture}`} 
                  alt="Profile" 
                  className="profile-picture-large"
                />
              ) : (
                <div className="profile-picture-placeholder-large">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </motion.div>

            <motion.div 
              className="profile-details"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="detail-card">
                <motion.div 
                  className="detail-item"
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">{user.full_name}</span>
                </motion.div>

                <motion.div 
                  className="detail-item"
                  whileHover={{ scale: 1.02 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="detail-label">Username</span>
                  <span className="detail-value">@{user.username}</span>
                </motion.div>

                <motion.div 
                  className="detail-item"
                  whileHover={{ scale: 1.02 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{user.email}</span>
                </motion.div>

                <motion.div 
                  className="detail-item"
                  whileHover={{ scale: 1.02 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{user.phone}</span>
                </motion.div>

                <motion.div 
                  className="detail-item"
                  whileHover={{ scale: 1.02 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="profile-footer"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="thank-you-message">
              Thank you for being a valued member of our community!
            </p>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default CustomerProfile;