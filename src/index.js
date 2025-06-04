import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Customers/Cart";
import Login from "./pages/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Checkout from "./pages/Customers/Checkout";
import Profile from "./pages/Customers/Profile";
import Store from "./pages/Store";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AddProducts from "./pages/Admin/Products/AddProducts";

import Orders from "./pages/Admin/Orders/Orders";
import Products from "./pages/Admin/Products/Products";
import Setting from "./pages/Admin/Setting";
import Customers from "./pages/Admin/Customers";

import ProductDetails from "./pages/ProductDetails";
import ErrorPage from "./pages/ErrorPage"; // Create this component


const root = ReactDOM.createRoot(document.getElementById("root"));
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "home",
    element: <Home />,
  },
  {
    path: "about",
    element: <About />,
  },
  {
    path: "contact",
    element: <Contact />,
  },
  {
    path: "profile",
    element: <Profile />,
  },
  {
    path: "cart",
    element: <Cart />,
  },
  {
    path: "checkout",
    element: <Checkout />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "store",
    element: <Store />
  },
  {
    path: "admin-dashboard",
    element: <AdminDashboard />
  },
  {
    path:"AddProducts",
    element: <AddProducts/>
  },
  
  {
    path:"Orders",
    element: <Orders/>
  },
  {
    path:"Products",
    element: <Products/>
  },
  {
    path:"Setting",
    element: <Setting/>
  },
  {
    path:"Customers",
    element: <Customers/>
  },
  
  {
    path: "add-products",
    element: <AddProducts />
  },
  {
    path: "product/:id", // Dynamic route parameter
    element: <ProductDetails />
  }
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();