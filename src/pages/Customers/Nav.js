import { IoHome } from "react-icons/io5";
import { FaHotel, FaBookOpen } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { MdContactPhone } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import "./Nav.css";

function Nav() {
  const { pathname } = useLocation();
  
  const navItems = [
    { path: "/Home", icon: <IoHome />, text: "Home" },
    { path: "/Store", icon: <FaHotel />, text: "Store" },
    { path: "/Profile", icon: <CgProfile />, text: "Profile" },
    { path: "/About", icon: <FaBookOpen />, text: "About" },
    { path: "/Contact", icon: <MdContactPhone />, text: "Contact" }
  ];

  return (
    <nav className="custom-nav-bar">
      <ul className="custom-nav-list">
        {navItems.map((item) => (
          <li 
            key={item.path} 
            className={`custom-nav-item ${
              pathname === item.path ? "custom-active-nav" : ""
            }`}
          >
            <Link to={item.path} className="custom-nav-link">
              <span className="custom-nav-icon">{item.icon}</span>
              <span className="custom-nav-text">{item.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Nav;