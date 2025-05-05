import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
//import App from "./App";
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
import AddCategory from "./pages/Admin/AddCategory";
import AddProduct from "./pages/Admin/AddProduct";
import EditProduct from "./pages/Admin/EditProduct";
import EditCategory from "./pages/Admin/EditCategory";
import ManageCategory from "./pages/Admin/ManageCategory";
import ManageProduct from "./pages/Admin/ManageProducts";
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
    path: "AddCategory",
    element: <AddCategory />,
  },
  {
    path: "AddProduct",
    element: <AddProduct />,
  },
  {
    path: "EditCategory",
    element: <EditCategory />,
  },
  {
    path: "ManageCatogory",
    element: <ManageCategory />,
  },
  {
    path: "ManageProduct",
    element: <ManageProduct />,
  },
  {
    path: "EditProduct",
    element: <EditProduct />,
  },
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();
