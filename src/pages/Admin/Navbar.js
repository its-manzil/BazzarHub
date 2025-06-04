import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Logo from "../Logo";
import "./navbar.css";

function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: "/AdminDashboard", name: "Dashboard" },
    { path: "/Orders", name: "Orders" },
    { path: "/Products", name: "Products" },
    { path: "/AddProducts", name: "Add Products" },
    { path: "/Customers", name: "Customers" },
    { path: "/Setting", name: "Setting" },
    { path: "/Logout", name: "Logout", isLogout: true },
  ];

  return (
    <>
      <div className="admin-nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>
      <nav className={`nav1 ${menuOpen ? "open" : ""}`}>
        <Logo/>
        {/* <div className="admin-header">BazaarHub Admin</div> */}
        <ul>
          {navItems.map((item) => (
            <li
              key={item.path}
              className={`AdminNav ${location.pathname === item.path ? "active" : ""} ${
                item.isLogout ? "logout" : ""
              }`}
              onClick={() => setMenuOpen(false)} // auto-close on click
            >
              <Link to={item.path} className="Link1">
                <button className="text1">{item.name}</button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
