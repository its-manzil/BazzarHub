import { Link, useLocation } from "react-router-dom";
import "./navbar.css";

function Navbar() {
  const location = useLocation();

  const navItems = [
    {path: "/", name: "Home"},
    {path: "/Admin", name: "AdminDashboard"},
    { path: "/AdminOrders", name: "Orders" },
    { path: "/ProductsList", name: "Products" },
    { path: "/AddProducts", name: "AddProducts" },
    { path: "/CustomersList", name: "Customers" },
    { path: "/Logout", name: "Logout", isLogout: true },
  ];

  return (
    <nav className="navbar-admin">
      <ul className="navbar-admin__list">
        {navItems.map((item) => (
          <li 
            key={item.path} 
            className={`
              navbar-admin__item 
              ${location.pathname === item.path ? "navbar-admin__item--active" : ""} 
              ${item.isLogout ? "navbar-admin__item--logout" : ""}
            `}
          >
            <Link to={item.path} className="navbar-admin__link">
              <button className="navbar-admin__button">{item.name}</button>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;