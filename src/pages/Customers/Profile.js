import React, { useState } from "react";
import Nav from "./Nav";
import "./profile.css";

// voklagyo/src/pages/profile.js

function Profile() {
  // Use state to manage the positions of elements
  const [loginStyle, setLoginStyle] = useState({ left: "50px" });
  const [registerStyle, setRegisterStyle] = useState({ left: "450px" });
  const [btnStyle, setBtnStyle] = useState({ left: "0px" });

  // Event handlers to update styles
  const register = () => {
    setLoginStyle({ left: "-400px" });
    setRegisterStyle({ left: "50px" });
    setBtnStyle({ left: "110px" });
  };

  const login = () => {
    setLoginStyle({ left: "50px" });
    setRegisterStyle({ left: "450px" });
    setBtnStyle({ left: "0px" });
  };

  return (
    <div>
      <Nav />
      <div className="hero" id="profile1">
        <div className="form-box">
          <div className="buttonBox">
            <div id="btn1" style={btnStyle}></div>
            <button type="button" className="toggle-btn" onClick={login}>
              Log In
            </button>
            <button type="button" className="toggle-btn" onClick={register}>
              Register
            </button>
          </div>

          <form id="login" className="input-group" style={loginStyle}>
            <input
              type="number"
              className="input-field"
              placeholder="Enter Phone Number"
              required
            />
            <input
              type="password"
              className="input-field"
              placeholder="Enter Password"
              id="visible"
              required
            />
            <br />
            <input type="checkbox" className="check-box" />
            <span>Remember Password</span>
            <button type="submit" className="submit-btn">
              Log In
            </button>
          </form>
          <form id="register" className="input-group" style={registerStyle}>
            <input
              type="text"
              className="input-field"
              placeholder="Your Name"
              required
            />
            <input
              type="email"
              className="input-field"
              placeholder="Enter Email ID"
              required
            />
            <input
              type="number"
              className="input-field"
              placeholder="Enter Phone Number"
              required
            />

            <input
              type="password"
              className="input-field"
              placeholder="Enter Password"
              required
            />
            <input
              type="password"
              className="input-field"
              placeholder="Re-enter Password"
              required
            />
            <input type="checkbox" className="check-box" />
            <span>I agree to the terms and conditions</span>
            <button type="submit" className="submit-btn">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
