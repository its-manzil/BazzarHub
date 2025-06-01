import React from "react";
import Navbar from "../Navbar";
import "./orders.css";

function Orders() {
  const orders = [
    {
      id: "#1001",
      customer: "Ramesh Adhikari",
      amount: "₹3,500",
      status: "Delivered",
      payment: "Online",
      date: "2025-05-28",
    },
    {
      id: "#1002",
      customer: "Sita Koirala",
      amount: "₹1,200",
      status: "Pending",
      payment: "Cash on Delivery",
      date: "2025-05-29",
    },
    {
      id: "#1003",
      customer: "Hari Sharma",
      amount: "₹2,800",
      status: "Cancelled",
      payment: "Online",
      date: "2025-05-30",
    },
  ];

  return (
    <div className="orders-dashboard">
      <Navbar />
      <div className="orders-content">
        <h1 className="orders-title">All Orders</h1>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.amount}</td>
                <td>
                  <span className={`status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.payment}</td>
                <td>{order.date}</td>
                <td>
                  <button className="view-btn">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;
