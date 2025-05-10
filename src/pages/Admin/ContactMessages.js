import React, { useState } from 'react';
import AdminSideBar from './AdminSideBar';
import './contactmessages.css';

function ContactMessages() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      message: 'I have an issue with my order.',
      status: 'Open'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      message: 'Do you offer international shipping?',
      status: 'Responded'
    }
  ]);

  const handleStatusChange = (id, newStatus) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, status: newStatus } : msg
      )
    );
  };

  return (
    <div className="admin-page-layout">
      <AdminSideBar />
      <div className="admin-contact">
        <div className="contact-header">
          <h1 className="contact-title">Customer Messages</h1>
          <p className="contact-subtext">Review and manage inquiries from your customers.</p>
        </div>

        <div className="messages-table-wrapper">
          <table className="messages-table">
            <thead>
              <tr>
                <th>Sl No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg, index) => (
                <tr key={msg.id}>
                  <td>{index + 1}</td>
                  <td>{msg.name}</td>
                  <td>{msg.email}</td>
                  <td>{msg.message}</td>
                  <td>
                    <span
                      className={`status-badge ${msg.status.toLowerCase()}`}
                    >
                      {msg.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-dropdown"
                      value={msg.status}
                      onChange={e => handleStatusChange(msg.id, e.target.value)}
                    >
                      <option value="Open">Open</option>
                      <option value="Responded">Responded</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No messages found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ContactMessages;
