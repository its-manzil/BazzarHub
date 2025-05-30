import { Link, useLocation } from "react-router-dom";
import "./navbar.css";

function Navbar() {
  const location = useLocation(); // Gets current URL path

  
  const navItems = [
    { path: "/AdminDashboard", name: "Dashboard" },
    { path: "/Orders", name: "Orders" },
    { path: "/ProductsList", name: "Products" },
    { path: "/AddProducts", name: "AddProducts" },
    { path: "/Customers", name: "Customers" },
    { path: "/Setting", name: "Setting" },
    { path: "/Logout", name: "Logout", isLogout: true },
  ];

  return (
    <nav className="nav1">
      <ul>
        {navItems.map((item) => (
          <li 
            key={item.path} 
            className={`AdminNav ${location.pathname === item.path ? "active" : ""} ${item.isLogout ? "logout" : ""}`}
          >
            <Link to={item.path} className="Link1">
              <button className="text1">{item.name}</button>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;