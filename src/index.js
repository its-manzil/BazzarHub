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
import UserSetting from "./pages/Customers/UserSetting";
import Store from "./pages/Store";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AddProducts from "./pages/Admin/Products/AddProducts";
import ProductDetails from "./pages/ProductDetails";
import ErrorPage from "./pages/ErrorPage"; 
import Results from "./pages/Results";
import CustomerProfile from "./pages/Customers/CustomerProfile";
import ProductsList from "./pages/Admin/Products/ProductsList";
import CustomersList from "./pages/Admin/CustomersList";
import MyOrders from "./pages/Customers/MyOrders";
import CustomerDashboard from "./pages/Customers/CustomerDashboard";
import AdminOrders from "./pages/Admin/Orders/AdminOrders";


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
    path: "usersetting",
    element: <UserSetting />,
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
    path: "admin",
    element: <AdminDashboard />
  },
  {
    path: "addproducts",
    element: <AddProducts />
  },
  {
    path: "product/:id", // Dynamic route parameter
    element: <ProductDetails />
  },
  {
    path: "results",
    element: <Results/>
  },
  {
    path: "customerprofile",
    element :<CustomerProfile/>
  },
  
    
  {
    path: "AdminDashboard",
    element: <AdminDashboard/>
  },
  {
    path: "Orders",
    element: <MyOrders/>
  },
  {
    path:"ProductsList",
    element:<ProductsList/>
  },
  {
    path:"CustomersList",
    element:<CustomersList/>
  },
  {
    path:"CustomerOrders",
    element:<MyOrders/>
  },
  {
    path:"CustomerDashboard",
    element:<CustomerDashboard/>
  },
  {
    path: "AdminOrders",
    element: <AdminOrders/>
  }
  

]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();