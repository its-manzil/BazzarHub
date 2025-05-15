import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import Nav from './Nav';
import Logo from "./Logo";
import CartLogo from './CartLogo';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    storeName: '',
    profilePicture: null,
    userType: 'customer',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^[0-9]{7,15}$/;

    if (isLogin) {
      if (!formData.username && !formData.email && !formData.phone) {
        newErrors.loginField = 'Please enter username, email or phone';
      }

      if (formData.username && !usernameRegex.test(formData.username)) {
        newErrors.loginField = 'Username must be 3-20 characters with letters, numbers or underscores';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    } else {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email format is invalid';
      }

      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Phone number must be 7 to 15 digits';
      }

      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (!usernameRegex.test(formData.username)) {
        newErrors.username = 'Username must be 3-20 characters with letters, numbers or underscores';
      }

      if (formData.userType === 'customer') {
        if (!formData.firstName) {
          newErrors.firstName = 'First name is required';
        } else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
          newErrors.firstName = 'First name must only contain letters';
        }

        if (!formData.lastName) {
          newErrors.lastName = 'Last name is required';
        } else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) {
          newErrors.lastName = 'Last name must only contain letters';
        }
      } else {
        if (!formData.storeName) {
          newErrors.storeName = 'Store name is required';
        }
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must include uppercase, lowercase, and number';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (formData.profilePicture) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(formData.profilePicture.type)) {
          newErrors.profilePicture = 'Only JPG, JPEG, and PNG formats are allowed';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form data:', formData);
      if (isLogin) {
        alert('Login successful!');
        navigate('/dashboard');
      } else {
        alert('Account created successfully! Please verify your email.');
        setIsLogin(true);
      }
    }
  };

  return (
    <>
      <Nav />
      <Logo />
      <CartLogo />
      <div className="login-container">
        <div className={`form-container ${isLogin ? 'login' : 'signup'}`}>
          <div className="form-content">
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            {isLogin ? (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label>Username, Email or Phone</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username, email or phone"
                  />
                  {errors.loginField && <span className="error">{errors.loginField}</span>}
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                    />
                    <button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password && <span className="error">{errors.password}</span>}
                </div>

                <div className="form-group remember-forgot">
                  <div>
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember">Remember me</label>
                  </div>
                  <a href="/forgot-password">Forgot password?</a>
                </div>

                <button type="submit" className="submit-btn">Login</button>
                <p className="toggle-form">
                  Don't have an account?
                  <button type="button" onClick={() => setIsLogin(false)}>Sign up</button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="signup-form">
                <div className="two-column">
                  <div className="form-group">
                    <label>Email*</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                    />
                    {errors.email && <span className="error">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label>Phone*</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && <span className="error">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Username*</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                  />
                  {errors.username && <span className="error">{errors.username}</span>}
                </div>

                {formData.userType === 'customer' ? (
                  <div className="two-column">
                    <div className="form-group">
                      <label>First Name*</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                      />
                      {errors.firstName && <span className="error">{errors.firstName}</span>}
                    </div>

                    <div className="form-group">
                      <label>Last Name*</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                      />
                      {errors.lastName && <span className="error">{errors.lastName}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Store Name*</label>
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      placeholder="Enter store name"
                    />
                    {errors.storeName && <span className="error">{errors.storeName}</span>}
                  </div>
                )}

                <div className="two-column">
                  <div className="form-group">
                    <label>Password*</label>
                    <div className="password-input">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create password"
                      />
                      <button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {errors.password && <span className="error">{errors.password}</span>}
                  </div>

                  <div className="form-group">
                    <label>Confirm Password*</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                    />
                    {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Profile Picture (Optional)</label>
                  <input
                    type="file"
                    name="profilePicture"
                    onChange={handleChange}
                    accept="image/*"
                  />
                  {errors.profilePicture && <span className="error">{errors.profilePicture}</span>}
                </div>

                <button type="submit" className="submit-btn">Create Account</button>
                <p className="toggle-form">
                  Already have an account?
                  <button type="button" onClick={() => setIsLogin(true)}>Login</button>
                </p>
              </form>
            )}
          </div>
          <div className="image-container">
            <img src="images/eCommerce.jpg" height={450} width={350} alt="Login Illustration" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
