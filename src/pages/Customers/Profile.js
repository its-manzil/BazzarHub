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
  const [orders, setOrders] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    profile_picture: null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  // Fetch user profile and orders
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
        setEditData({
          full_name: profileData.user.full_name,
          username: profileData.user.username,
          email: profileData.user.email,
          phone: profileData.user.phone,
          profile_picture: null,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Fetch user orders
        const ordersResponse = await fetch(`http://localhost:8099/api/orders/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const ordersData = await ordersResponse.json();
        
        if (ordersResponse.ok) {
          // Sort orders by date (newest first)
          const sortedOrders = ordersData.orders.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          );
          setOrders(sortedOrders);
        }
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

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile_picture') {
      setEditData({ ...editData, [name]: files[0] });
    } else {
      setEditData({ ...editData, [name]: value });
    }
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateEditForm = () => {
    const newErrors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^[0-9]{7,15}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (!editData.full_name) {
      newErrors.full_name = 'Full name is required';
    }

    if (!editData.username) {
      newErrors.username = 'Username is required';
    } else if (!usernameRegex.test(editData.username)) {
      newErrors.username = 'Username must be 3-20 characters (letters, numbers, underscores)';
    }

    if (!editData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(editData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!editData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(editData.phone)) {
      newErrors.phone = 'Phone must be 7-15 digits';
    }

    // Password validation only if any password field is filled
    if (editData.currentPassword || editData.newPassword || editData.confirmPassword) {
      if (!editData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }

      if (!editData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (editData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(editData.newPassword) || 
                 !/[a-z]/.test(editData.newPassword) || 
                 !/[0-9]/.test(editData.newPassword)) {
        newErrors.newPassword = 'Password must include uppercase, lowercase, and number';
      }

      if (editData.newPassword !== editData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateEditForm()) return;

    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      const formData = new FormData();
      formData.append('full_name', editData.full_name);
      formData.append('username', editData.username);
      formData.append('email', editData.email);
      formData.append('phone', editData.phone);
      
      if (editData.profile_picture) {
        formData.append('profile_picture', editData.profile_picture);
      }
      
      if (editData.newPassword) {
        formData.append('currentPassword', editData.currentPassword);
        formData.append('newPassword', editData.newPassword);
      }

      const response = await fetch(`http://localhost:8099/api/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.field) {
          setErrors({ ...errors, [data.field]: data.message });
        } else {
          throw new Error(data.message || 'Failed to update profile');
        }
        return;
      }

      // Update local user data
      setUser(data.user);
      setEditMode(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reset password fields
      setEditData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError(err.message);
      console.error('Update error:', err);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setErrors({});
    // Reset edit data to current user data
    setEditData({
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      profile_picture: null,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const getOrderStatusClass = (status) => {
    switch (status) {
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      default: return '';
    }
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
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Order History
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="profile-card">
            <div className="profile-header">
              <h2>My Profile</h2>
              <div className="profile-actions">
                {editMode ? (
                  <>
                    <button onClick={handleSaveProfile} className="save-btn">Save Changes</button>
                    <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(true)} className="edit-btn">Edit Profile</button>
                )}
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            </div>
            
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            {user && (
              <div className="profile-content">
                <div className="profile-picture-section">
                  {editMode ? (
                    <div className="profile-picture-edit">
                      <div className="current-picture">
                        {user.profile_picture ? (
                          <img 
                            src={`http://localhost:8099/uploads/${user.profile_picture}`} 
                            alt="Current Profile" 
                            className="profile-picture"
                          />
                        ) : (
                          <div className="profile-picture-placeholder">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <label className="upload-btn">
                        Change Photo
                        <input 
                          type="file" 
                          name="profile_picture" 
                          onChange={handleEditChange}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                      </label>
                      {errors.profile_picture && <span className="error">{errors.profile_picture}</span>}
                    </div>
                  ) : (
                    <div className="profile-picture-container">
                      {user.profile_picture ? (
                        <img 
                          src={`http://localhost:8099/uploads/${user.profile_picture}`} 
                          alt="Profile" 
                          className="profile-picture"
                        />
                      ) : (
                        <div className="profile-picture-placeholder">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="profile-details">
                  {editMode ? (
                    <form className="edit-form">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          name="full_name"
                          value={editData.full_name}
                          onChange={handleEditChange}
                        />
                        {errors.full_name && <span className="error">{errors.full_name}</span>}
                      </div>
                      
                      <div className="form-group">
                        <label>Username</label>
                        <input
                          type="text"
                          name="username"
                          value={editData.username}
                          onChange={handleEditChange}
                        />
                        {errors.username && <span className="error">{errors.username}</span>}
                      </div>
                      
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleEditChange}
                        />
                        {errors.email && <span className="error">{errors.email}</span>}
                      </div>
                      
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={editData.phone}
                          onChange={handleEditChange}
                        />
                        {errors.phone && <span className="error">{errors.phone}</span>}
                      </div>
                      
                      <div className="password-section">
                        <h3>Change Password</h3>
                        <div className="form-group">
                          <label>Current Password</label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={editData.currentPassword}
                            onChange={handleEditChange}
                            placeholder="Enter current password"
                          />
                          {errors.currentPassword && <span className="error">{errors.currentPassword}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label>New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            value={editData.newPassword}
                            onChange={handleEditChange}
                            placeholder="Enter new password"
                          />
                          {errors.newPassword && <span className="error">{errors.newPassword}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label>Confirm Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={editData.confirmPassword}
                            onChange={handleEditChange}
                            placeholder="Confirm new password"
                          />
                          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
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
                          {new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="orders-card">
            <h2>Order History</h2>
            {orders.length === 0 ? (
              <div className="no-orders">
                <p>You haven't placed any orders yet.</p>
                <button onClick={() => navigate('/')} className="shop-btn">Start Shopping</button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.order_id} className="order-item">
                    <div className="order-header">
                      <div className="order-id">Order #{order.order_id}</div>
                      <div className={`order-status ${getOrderStatusClass(order.order_status)}`}>
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="order-date">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    
                    <div className="order-summary">
                      <div className="order-total">
                        Total: ${order.total_amount.toFixed(2)}
                      </div>
                      <button 
                        onClick={() => navigate(`/order/${order.order_id}`)}
                        className="order-details-btn"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div> 
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;