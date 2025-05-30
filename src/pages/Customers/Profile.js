import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import CustomerNav from './CustomerNav';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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
        setEditData({
          full_name: profileData.user.full_name,
          username: profileData.user.username,
          email: profileData.user.email,
          phone: profileData.user.phone,
          profile_picture: null,
        });
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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
    setErrors({});
    setEditData({
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      profile_picture: null,
    });
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
    <CustomerNav/>
    <div className="profile-content-area">
      {successMessage && <div className="success-message">{successMessage}</div>}
      
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
    </div>
    </>
  );
};

export default Profile;