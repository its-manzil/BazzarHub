import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './CustomersList.css';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        // API endpoint to get all customers
        const res = await axios.get('http://localhost:8099/api/customers');
        
        // Assuming backend sends an array of customers in res.data.customers
        setCustomers(res.data.customers || []);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <>
      <Navbar />
      <div className="customerslist-container">
        <header className="customerslist-header">
          <h1 className="customerslist-title">Customers</h1>
          <p className="customerslist-subtitle">Manage your customer information</p>
        </header>

        {error && <div className="customerslist-alert error">{error}</div>}

        {loading ? (
          <p>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <div className="customerslist-table-wrapper">
            <table className="customerslist-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.full_name}</td>
                    <td>{customer.username}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomersList;
