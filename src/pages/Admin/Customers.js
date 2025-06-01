import React from "react";
import Navbar from "./Navbar";
import "./customers.css";

function Customers() {
  return (
    <div className="customers-container">
      <Navbar />
      <div className="customers-content">
        <h1 className="customers-title">Customers</h1>

        <div className="customers-card">
          <div className="customers-header">
            <h2 className="card-title">Customer List</h2>
            <input
              type="text"
              placeholder="Search customers..."
              className="search-input"
            />
          </div>

          <div className="table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#1001</td>
                  <td>Abiral Acharya</td>
                  <td>abiral@example.com</td>
                  <td>9800000000</td>
                  <td><span className="active">Active</span></td>
                </tr>
                <tr>
                  <td>#1002</td>
                  <td>John Smith</td>
                  <td>johnsmith@gmail.com</td>
                  <td>9812345678</td>
                  <td><span className="inactive">Inactive</span></td>
                </tr>
                {/* Add more dummy rows or dynamic data here */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Customers;
