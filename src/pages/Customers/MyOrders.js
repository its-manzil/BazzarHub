import React from 'react';
import './MyOrders.css';
import Nav from '../Nav';
import CustomerNav from './CustomerNav';
const MyOrders = () => {
  const orders = [
    {
      orderId: 101,
      date: '2025-08-01',
      totalAmount: 2599.99,
      status: 'Delivered',
      itemsCount: 3,
    },
    {
      orderId: 102,
      date: '2025-08-05',
      totalAmount: 1299.5,
      status: 'Processing',
      itemsCount: 1,
    },
    {
      orderId: 103,
      date: '2025-08-07',
      totalAmount: 499.0,
      status: 'Cancelled',
      itemsCount: 2,
    },
  ];

  const formatPrice = (price) => {
    return `Rs. ${price.toFixed(2)}`;
  };

  return (
    <div className="my-orders-page">
        <Nav/>
        <CustomerNav/>
      <div className="my-orders-container">
        <h1>My Orders</h1>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{new Date(order.date).toLocaleDateString()}</td>
                <td>{order.itemsCount}</td>
                <td>{formatPrice(order.totalAmount)}</td>
                <td className={`status ${order.status.toLowerCase()}`}>
                  {order.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyOrders;
