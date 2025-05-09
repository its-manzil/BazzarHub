import React from 'react';
import './orders.css';

function Orders() {
  return (
    <div className="admin-orders">
      <h1 className="orders-title">Order Management</h1>
      <p className="orders-subtext">
        View and process customer orders. Update their status as needed.
      </p>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#1023</td>
              <td>Abiral Acharya</td>
              <td>Pending</td>
              <td>$120.00</td>
              <td><button className="btn-update">Update</button></td>
            </tr>
            {/* More rows to be loaded dynamically */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;
