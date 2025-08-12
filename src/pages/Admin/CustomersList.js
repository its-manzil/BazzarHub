import React, { useState, useEffect } from 'react';
import './CustomersList.css';
import Navbar from './Navbar';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ 
    key: 'total_spent', 
    direction: 'descending' 
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('http://localhost:8099/api/customers');
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process data to ensure correct types
        const processedData = data.map(customer => ({
          ...customer,
          total_spent: parseFloat(customer.total_spent) || 0,
          total_orders: parseInt(customer.total_orders) || 0,
          created_at: new Date(customer.created_at)
        }));
        
        setCustomers(processedData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedCustomers = React.useMemo(() => {
    let sortableCustomers = [...customers];
    if (sortConfig.key) {
      sortableCustomers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableCustomers;
  }, [customers, sortConfig]);

  const filteredCustomers = sortedCustomers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.username.toLowerCase().includes(searchLower) || 
      customer.email.toLowerCase().includes(searchLower) ||
      customer.full_name.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="customers-container">
        <Navbar />
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customers-container">
        <Navbar />
        <div className="error-message">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customers-container">
      <Navbar />
      <div className="customers-content">
        <h1>Customer Dashboard</h1>
        
        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={handleSearch}
              aria-label="Search customers"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="customers-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('username')}>
                  Username {sortConfig.key === 'username' && (
                    sortConfig.direction === 'ascending' ? '↑' : '↓'
                  )}
                </th>
                <th onClick={() => requestSort('full_name')}>
                  Name {sortConfig.key === 'full_name' && (
                    sortConfig.direction === 'ascending' ? '↑' : '↓'
                  )}
                </th>
                <th onClick={() => requestSort('email')}>
                  Email {sortConfig.key === 'email' && (
                    sortConfig.direction === 'ascending' ? '↑' : '↓'
                  )}
                </th>
                <th onClick={() => requestSort('total_orders')}>
                  Orders {sortConfig.key === 'total_orders' && (
                    sortConfig.direction === 'ascending' ? '↑' : '↓'
                  )}
                </th>
                <th onClick={() => requestSort('total_spent')}>
                  Total Spent {sortConfig.key === 'total_spent' && (
                    sortConfig.direction === 'ascending' ? '↑' : '↓'
                  )}
                </th>
                <th onClick={() => requestSort('created_at')}>
                  Joined {sortConfig.key === 'created_at' && (
                    sortConfig.direction === 'ascending' ? '↑' : '↓'
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-info">
                        {customer.profile_picture ? (
                          <img 
                            src={`http://localhost:8099/uploads/${customer.profile_picture}`} 
                            alt={customer.username}
                            className="customer-avatar"
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {customer.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{customer.username}</span>
                      </div>
                    </td>
                    <td>{customer.full_name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.total_orders}</td>
                    <td>Rs. {customer.total_spent.toFixed(2)}</td>
                    <td>{formatDate(customer.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr className="no-results">
                  <td colSpan="6">
                    No customers found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomersList;