import React from 'react';
import './reports.css';

function Reports() {
  return (
    <div className="admin-reports">
      <h1 className="reports-title">Reports & Analytics</h1>
      <p className="reports-subtext">
        Monitor sales, revenue, and performance insights to help grow your business.
      </p>

      <div className="reports-grid">
        <div className="report-card">
          <h3>Total Sales</h3>
          <p>$8,230</p>
        </div>
        <div className="report-card">
          <h3>Orders This Month</h3>
          <p>126</p>
        </div>
        <div className="report-card">
          <h3>New Customers</h3>
          <p>34</p>
        </div>
        <div className="report-card">
          <h3>Refunds</h3>
          <p>3</p>
        </div>
      </div>

      <div className="reports-note">
        <p>For detailed analytics, connect to a third-party dashboard or export data.</p>
      </div>
    </div>
  );
}

export default Reports;
