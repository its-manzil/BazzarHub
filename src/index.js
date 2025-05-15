import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Home from "./pages/Customers/Home";
import About from "./pages/Customers/About";
import Contact from "./pages/Customers/Contact";
import Cart from "./pages/Customers/Cart";
import Store from "./pages/Customers/Store";
import Login from "./pages/Customers/Login";
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import Checkout from "./pages/Customers/Checkout";
import Profile from "./pages/Customers/Profile";
import Dashboard from "./pages/Customers/Dashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminSidebar from "./pages/Admin/AdminSideBar";
import Products from "./pages/Admin/Products";
import Settings from "./pages/Admin/Settings";
import Orders from "./pages/Admin/Orders";
import Categories from "./pages/Admin/Categories";
import Reports from "./pages/Admin/Reports";
import ContactMessages from "./pages/Admin/ContactMessages";
import AdminLogin from "./pages/Admin/AdminLogin";
import Stock from "./pages/Admin/Stock";




const root = ReactDOM.createRoot(document.getElementById("root"));
const router = createBrowserRouter([
  {
    path: "/",
    
    element: <Home />,
  },
  {
    path: "Home",
    element: <Home />,
  },
  {
    path: "About",
    element: <About />,
  },
  {
    path: "Contact",
    element: <Contact />,
  },
  {
    path: "Dashboard",
    element: <Dashboard/>,
  },
  {
    path: "Profile",
    element: <Profile />,
  },
  {
    path: "Cart",
    element: <Cart />,
  },
  {
    path: "Checkout",
    element: <Checkout />,
  },
  
  {
    path: "Store",
    element: <Store />,
  },
  {
    path: "Login",
    element: <Login />,
  },
  {
    path: "AdminDashboard",
    element: <AdminDashboard />,
  },
  
  {
    path: "AdminSideBar",
    element: <AdminSidebar />,
  },
  {
    path: "Products",
    element: <Products />,
  },
  {
    path: "Categories",
    element: <Categories />,
  },
  {
    path: "Orders",
    element: <Orders />,
  },
    {
    path: "Reports",
    element: <Reports />,
  },

  {
    path: "Settings",
    element: <Settings />,
  },
  {
    path: "ContactMessages",
    element: <ContactMessages />,
  },
  {
    path: "Admin",
    element: <AdminLogin />,
  },
  {
    path: "Stock",
    element: <Stock />,
  }

  
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();
