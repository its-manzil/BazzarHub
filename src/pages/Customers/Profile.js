import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import Nav from './Nav';


Chart.register(...registerables);

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
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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
        });

        // Fetch user orders
        const ordersResponse = await fetch(`http://localhost:8099/api/orders/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const ordersData = await ordersResponse.json();
        
        if (ordersResponse.ok) {
          const sortedOrders = ordersData.orders.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          );
          setOrders(sortedOrders);
        }

        // Fetch chat messages (simulated)
        const mockMessages = [
          { id: 1, sender: 'support', text: 'Hello! How can we help you today?', time: '10:30 AM' },
          { id: 2, sender: 'user', text: 'I have a question about my recent order', time: '10:32 AM' }
        ];
        setChatMessages(mockMessages);
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
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const toggleShowPassword = () => {
    setPasswordData({ ...passwordData, showPassword: !passwordData.showPassword });
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(passwordData.newPassword) || 
               !/[a-z]/.test(passwordData.newPassword) || 
               !/[0-9]/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must include uppercase, lowercase, and number';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

      setUser(data.user);
      setEditMode(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Update error:', err);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      const response = await fetch(`http://localhost:8099/api/profile/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.field) {
          setErrors({ ...errors, [data.field]: data.message });
        } else {
          throw new Error(data.message || 'Failed to change password');
        }
        return;
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showPassword: false
      });
      setShowPasswordModal(false);
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Password change error:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm account deletion');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      const response = await fetch(`http://localhost:8099/api/profile/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: deletePassword
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setDeleteError(data.message || 'Failed to delete account');
        return;
      }

      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      navigate('/login');
    } catch (err) {
      setDeleteError('Error deleting account. Please try again.');
      console.error('Delete error:', err);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setErrors({});
    setEditData({
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      profile_picture: null,
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

  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8099/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel order');
      }

      // Update the orders list
      const updatedOrders = orders.map(order => 
        order.order_id === orderId ? { ...order, order_status: 'cancelled' } : order
      );
      setOrders(updatedOrders);
      setSuccessMessage('Order cancelled successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Cancel order error:', err);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: chatMessages.length + 1,
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setMessage('');
    
    // Simulate response
    setTimeout(() => {
      const responseMessage = {
        id: chatMessages.length + 2,
        sender: 'support',
        text: 'Thanks for your message. Our team will get back to you shortly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, responseMessage]);
    }, 1000);
  };

  // Prepare data for charts
  const orderStatusData = {
    labels: ['Delivered', 'Shipped', 'Processing', 'Pending', 'Cancelled'],
    datasets: [{
      data: [
        orders.filter(o => o.order_status === 'delivered').length,
        orders.filter(o => o.order_status === 'shipped').length,
        orders.filter(o => o.order_status === 'processing').length,
        orders.filter(o => o.order_status === 'pending').length,
        orders.filter(o => o.order_status === 'cancelled').length
      ],
      backgroundColor: [
        '#4CAF50',
        '#2196F3',
        '#FFC107',
        '#FF9800',
        '#F44336'
      ]
    }]
  };

  const monthlySpendingData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Total Spending ($)',
      data: Array(12).fill(0).map((_, i) => 
        orders
          .filter(o => new Date(o.created_at).getMonth() === i)
          .reduce((sum, o) => sum + o.total_amount, 0)
      ),
      backgroundColor: '#3f51b5'
    }]
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
      
      
      <div className="profile-layout">
        {/* Left Sidebar Navigation */}
        <div className="profile-sidebar">
          <div className="sidebar-header">
            {user.profile_picture ? (
              <img 
                src={`http://localhost:8099/uploads/${user.profile_picture}`} 
                alt="Profile" 
                className="sidebar-profile-pic"
              />
            ) : (
              <div className="sidebar-profile-pic placeholder">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <h3>{user.full_name}</h3>
            <p>@{user.username}</p>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </button>
            
            <button 
              className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user"></i> Profile
            </button>
            
            <button 
              className={`nav-btn ${activeTab === 'update' ? 'active' : ''}`}
              onClick={() => setActiveTab('update')}
            >
              <i className="fas fa-edit"></i> Update Profile
            </button>
            
            <button 
              className="nav-btn logout-btn"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="profile-content-area">
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-tab">
              <h2>Dashboard</h2>
              
              <div className="stats-cards">
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <p>{orders.length}</p>
                </div>
                
                <div className="stat-card">
                  <h3>Pending Orders</h3>
                  <p>{orders.filter(o => o.order_status === 'pending').length}</p>
                </div>
                
                <div className="stat-card">
                  <h3>Total Spent</h3>
                  <p>${orders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="charts-row">
                <div className="chart-container">
                  <h3>Order Status Distribution</h3>
                  <Pie data={orderStatusData} />
                </div>
                
                <div className="chart-container">
                  <h3>Monthly Spending</h3>
                  <Bar data={monthlySpendingData} />
                </div>
              </div>
              
              <div className="recent-orders">
                <h3>Recent Orders</h3>
                {orders.length === 0 ? (
                  <div className="no-orders">
                    <p>You haven't placed any orders yet.</p>
                    <button onClick={() => navigate('/')} className="shop-btn">Start Shopping</button>
                  </div>
                ) : (
                  <div className="orders-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order.order_id}>
                            <td>#{order.order_id}</td>
                            <td>
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td>${order.total_amount.toFixed(2)}</td>
                            <td>
                              <span className={`status-badge ${getOrderStatusClass(order.order_status)}`}>
                                {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                              </span>
                            </td>
                            <td>
                              <button 
                                onClick={() => navigate(`/order/${order.order_id}`)}
                                className="view-btn"
                              >
                                View
                              </button>
                              {order.order_status === 'pending' && (
                                <button 
                                  onClick={() => handleCancelOrder(order.order_id)}
                                  className="cancel-btn"
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orders.length > 5 && (
                      <button 
                        onClick={() => setActiveTab('profile')}
                        className="view-all-btn"
                      >
                        View All Orders
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <div className="profile-info-section">
                <h2>Profile Information</h2>
                
                <div className="profile-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Full Name:</span>
                    <span className="detail-value">{user.full_name}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Username:</span>
                    <span className="detail-value">@{user.username}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{user.email}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{user.phone}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Member Since:</span>
                    <span className="detail-value">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                
                <h3>Order History</h3>
                {orders.length === 0 ? (
                  <div className="no-orders">
                    <p>You haven't placed any orders yet.</p>
                    <button onClick={() => navigate('/')} className="shop-btn">Start Shopping</button>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map(order => (
                      <div key={order.order_id} className="order-card">
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
                          <div className="order-actions">
                            <button 
                              onClick={() => navigate(`/order/${order.order_id}`)}
                              className="details-btn"
                            >
                              View Details
                            </button>
                            {order.order_status === 'pending' && (
                              <button 
                                onClick={() => handleCancelOrder(order.order_id)}
                                className="cancel-btn"
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="chat-section">
                <h2>Customer Support</h2>
                <div className="chat-container">
                  <div className="chat-messages">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`message ${msg.sender}`}>
                        <div className="message-content">
                          <p>{msg.text}</p>
                          <span className="message-time">{msg.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="chat-input">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage}>
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Update Tab */}
          {activeTab === 'update' && (
            <div className="update-tab">
              <h2>Update Profile</h2>
              
              <div className="update-form-container">
                <div className="profile-picture-update">
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
                </div>
                
                <form className="update-form">
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
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      onClick={handleSaveProfile} 
                      className="save-btn"
                    >
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      onClick={cancelEdit} 
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                
                <div className="account-actions">
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="change-password-btn"
                  >
                    Change Password
                  </button>
                  
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="delete-account-btn"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Change Password</h3>
            
            <div className="form-group">
              <label>Current Password</label>
              <div className="password-input">
                <input
                  type={passwordData.showPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
                <button 
                  type="button" 
                  className="show-password" 
                  onClick={toggleShowPassword}
                >
                  {passwordData.showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.currentPassword && <span className="error">{errors.currentPassword}</span>}
            </div>
            
            <div className="form-group">
              <label>New Password</label>
              <div className="password-input">
                <input
                  type={passwordData.showPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                />
              </div>
              {errors.newPassword && <span className="error">{errors.newPassword}</span>}
            </div>
            
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input">
                <input
                  type={passwordData.showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                />
              </div>
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                    showPassword: false
                  });
                  setErrors({});
                }} 
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleChangePassword} 
                className="confirm-btn"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Account Deletion</h3>
            <p>This action cannot be undone. All your data will be permanently deleted.</p>
            <div className="form-group">
              <label>Enter your password to confirm:</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
              />
              {deleteError && <span className="error">{deleteError}</span>}
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteError('');
                }} 
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount} 
                className="confirm-delete-btn"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;