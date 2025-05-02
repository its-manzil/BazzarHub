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
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();
