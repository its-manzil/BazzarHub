import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Customers/Cart";
import Login from "./pages/Login";
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import Checkout from "./pages/Customers/Checkout";
import Profile from "./pages/Customers/Profile";
import Store from "./pages/Store";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AddProducts from "./pages/Admin/Products/AddProducts";

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
    path: "Login",
    element: <Login />,
  },
  {
    path: "Store",
    element: <Store/>
  },
  {
    path: "AdminDashboard",
    element: <AdminDashboard/>
  },
  {
    path:"AddProducts",
    element: <AddProducts/>
  }

  
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();
