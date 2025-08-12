import React, { useState, useEffect } from 'react';
import './myOrders.css';
import { useNavigate } from 'react-router-dom';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiCalendar, 
  FiX, 
  FiCheck, 
  FiTruck, 
  FiClock, 
  FiRefreshCw,
  FiAlertCircle,
  FiPackage
} from 'react-icons/fi';

const MyOrder = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [dateFilter, setDateFilter] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', isError: false });
    const [activeTab, setActiveTab] = useState('active'); // 'active', 'cancelled', or 'delivered'
    const navigate = useNavigate();
    const ordersPerPage = 7;

    const handleDateFilterChange = (e) => {
        setDateFilter(e.target.value);
        setCurrentPage(1);
        setIsFilterOpen(false);
    };

    const clearDateFilter = () => {
        setDateFilter('');
        setCurrentPage(1);
    };

    // Helper function to process each order item
    const processItem = (item) => ({
        ...item,
        status: item.status || 'Pending' // Ensure status is always set
    });

    // Format price with Rs. symbol
    const formatPrice = (amount) => {
        const num = Number(amount || 0);
        return `Rs. ${num.toFixed(2)}`;
    };

    // Show notification message
    const showNotification = (message, isError = false) => {
        setNotification({ show: true, message, isError });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    // Format date with time
    const formatDateTime = (dateString) => {
        try {
            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch {
            return 'Unknown date/time';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        const statusStr = String(status || '').toLowerCase();
        switch (statusStr) {
            case 'delivered': return <FiCheck className="status-icon" />;
            case 'cancelled': return <FiX className="status-icon" />;
            case 'shipped': return <FiTruck className="status-icon" />;
            case 'processing': return <FiRefreshCw className="status-icon" />;
            case 'pending': return <FiClock className="status-icon" />;
            case 'ready to ship': return <FiPackage className="status-icon" />;
            case 'returned': return <FiRefreshCw className="status-icon" />;
            default: return <FiAlertCircle className="status-icon" />;
        }
    };

    // Get CSS class for status
    const getStatusClass = (status) => {
        const statusStr = String(status || '').toLowerCase();
        switch (statusStr) {
            case 'delivered': return 'delivered';
            case 'cancelled': return 'cancelled';
            case 'shipped': return 'shipped';
            case 'processing': return 'processing';
            case 'pending': return 'pending';
            case 'ready to ship': return 'ready-to-ship';
            case 'returned': return 'returned';
            default: return 'default';
        }
    };

    // Handle item cancellation
    const handleCancelItem = async (orderId, itemId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(
                `http://localhost:8099/api/orders/${orderId}/items/${itemId}/cancel`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to cancel item');
            }

            // Refetch orders to get updated status
            fetchOrders();
            showNotification('Item cancelled successfully');
        } catch (err) {
            console.error('Cancellation error:', err);
            showNotification(err.message || 'Failed to cancel item', true);
        }
    };

    // Fetch orders
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            let url = `http://localhost:8099/api/orders/my-orders?page=${currentPage}&limit=${ordersPerPage}&sort=desc`;
            if (dateFilter) {
                url += `&date=${dateFilter}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data.orders || []);
            setTotalPages(Math.ceil((data.total || 0) / data.limit));
        } catch (err) {
            console.error('Fetch orders error:', err);
            setError(err.message || 'Failed to load orders');
            showNotification(err.message || 'Failed to load orders', true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [navigate, currentPage, dateFilter]);

    // Filter orders based on active tab
    const getFilteredOrders = () => {
        if (!Array.isArray(orders)) return [];

        switch (activeTab) {
            case 'active':
                return orders.filter(order => 
                    order.status !== 'Cancelled' && 
                    order.status !== 'Delivered' &&
                    (order.items?.length > 0 || order.cancelledItems?.length > 0)
                );
            case 'cancelled':
                return orders.filter(order => 
                    order.status === 'Cancelled' || 
                    order.cancelledItems?.length > 0
                );
            case 'delivered':
                return orders.filter(order => 
                    order.status === 'Delivered' || 
                    order.items?.some(item => item.status === 'Delivered')
                );
            default:
                return [];
        }
    };

    const filteredOrders = getFilteredOrders();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <FiAlertCircle className="error-icon" />
                    <h2>Error Loading Orders</h2>
                    <p>{error}</p>
                    <button 
                        className="retry-btn"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-orders-container">
            {notification.show && (
                <div className={`notification ${notification.isError ? 'error' : ''}`}>
                    {notification.isError ? (
                        <FiAlertCircle className="notification-icon" />
                    ) : (
                        <FiCheck className="notification-icon" />
                    )}
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="orders-header">
                <h1>Your Orders</h1>
                <div className="header-controls">
                    <div className={`date-filter ${isFilterOpen ? 'open' : ''}`}>
                        <button 
                            className="filter-btn"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <FiCalendar className="filter-icon" />
                            {dateFilter ? 'Filter Applied' : 'Filter by Date'}
                        </button>
                        {isFilterOpen && (
                            <div className="filter-dropdown">
                                <input 
                                    type="date" 
                                    value={dateFilter} 
                                    onChange={handleDateFilterChange} 
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                {dateFilter && (
                                    <button 
                                        className="clear-filter"
                                        onClick={clearDateFilter}
                                    >
                                        Clear Filter
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="orders-tabs">
                <button
                    className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Orders
                </button>
                <button
                    className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cancelled')}
                >
                    Cancelled Orders
                </button>
                <button
                    className={`tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
                    onClick={() => setActiveTab('delivered')}
                >
                    Delivered Orders
                </button>
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
                <div className="orders-section">
                    <div className="orders-grid">
                        {filteredOrders.map(order => (
                            <div 
                                key={order.order_id} 
                                className={`order-card ${order.status === 'Cancelled' ? 'cancelled' : ''} ${order.status === 'Delivered' ? 'delivered' : ''}`}
                            >
                                <div className="order-header">
                                    <div className="order-meta">
                                        <span className="order-id">Order #{order.order_id}</span>
                                        <span className="order-date">{formatDateTime(order.created_at)}</span>
                                        <span className={`order-status ${getStatusClass(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="order-total">
                                        Total: <span>{formatPrice(order.activeTotal || order.originalTotal)}</span>
                                        {order.activeTotal !== order.originalTotal && activeTab === 'active' && (
                                            <span className="original-price">
                                                <del>{formatPrice(order.originalTotal)}</del>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Active Items */}
                                {(activeTab === 'active' || activeTab === 'delivered') && order.items?.length > 0 && (
                                    <div className="order-items">
                                        {order.items
                                            .filter(item => activeTab === 'active' || item.status === 'Delivered')
                                            .map(item => (
                                                <div key={item.order_item_id} className="order-item">
                                                    <div className="item-image-container">
                                                        <img 
                                                            src={`http://localhost:8099/uploads/${item.image_url}`} 
                                                            alt={item.product_name} 
                                                            className="item-image" 
                                                            onError={(e) => {
                                                                e.target.src = '/product-placeholder.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="item-details">
                                                        <h3 className="item-name">{item.product_name}</h3>
                                                        <div className="item-specs">
                                                            {item.variant_name && item.variant_value && (
                                                                <span className="item-variant">
                                                                    {item.variant_name}: {item.variant_value}
                                                                </span>
                                                            )}
                                                            <span className="item-qty">Qty: {item.quantity}</span>
                                                            <span className="item-price">{formatPrice(item.unit_price)}</span>
                                                        </div>
                                                        <div className="item-footer">
                                                            <div className={`status-badge ${getStatusClass(item.status)}`}>
                                                                {getStatusIcon(item.status)}
                                                                <span>{item.status}</span>
                                                            </div>
                                                            {item.status === 'Pending' && activeTab === 'active' && (
                                                                <button 
                                                                    className="cancel-item-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCancelItem(order.order_id, item.order_item_id);
                                                                    }}
                                                                >
                                                                    Cancel Item
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                {/* Cancelled Items */}
                                {order.cancelledItems?.length > 0 && (activeTab === 'cancelled' || activeTab === 'active') && (
                                    <div className="cancelled-items-section">
                                        <h3 className="cancelled-title">
                                            <FiX className="cancelled-icon" />
                                            Cancelled Items ({order.cancelledItems.length})
                                        </h3>
                                        <div className="cancelled-items">
                                            {order.cancelledItems.map(item => (
                                                <div key={item.order_item_id} className="cancelled-item">
                                                    <div className="item-image-container">
                                                        <img 
                                                            src={`http://localhost:8099/uploads/${item.image_url}`} 
                                                            alt={item.product_name} 
                                                            className="item-image" 
                                                            onError={(e) => {
                                                                e.target.src = '/product-placeholder.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="item-details">
                                                        <h4 className="item-name">{item.product_name}</h4>
                                                        <div className="item-specs">
                                                            {item.variant_name && item.variant_value && (
                                                                <span className="item-variant">
                                                                    {item.variant_name}: {item.variant_value}
                                                                </span>
                                                            )}
                                                            <span className="item-qty">Qty: {item.quantity}</span>
                                                            <span className="item-price">{formatPrice(item.unit_price)}</span>
                                                        </div>
                                                        <div className="item-footer">
                                                            <div className="status-badge cancelled">
                                                                <FiX className="status-icon" />
                                                                <span>Cancelled</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Fully Cancelled Orders */}
                                {activeTab === 'cancelled' && order.status === 'Cancelled' && order.items?.length === 0 && (
                                    <div className="fully-cancelled-notice">
                                        <FiX className="cancelled-icon" />
                                        <span>This order was fully cancelled</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="no-orders-in-tab">
                    <img 
                        src="/empty-orders.svg" 
                        alt="No orders" 
                        className="empty-illustration" 
                        onError={(e) => {
                            e.target.src = '/default-empty.svg';
                        }}
                    />
                    <h2>No {activeTab === 'active' ? 'Active' : activeTab === 'cancelled' ? 'Cancelled' : 'Delivered'} Orders</h2>
                    <p>You don't have any {activeTab === 'active' ? 'active' : activeTab === 'cancelled' ? 'cancelled' : 'delivered'} orders</p>
                </div>
            )}

            {/* Pagination */}
            <div className="pagination-controls">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1}
                    className="pagination-btn prev"
                >
                    <FiChevronLeft className="pagination-icon" />
                    Previous
                </button>
                <span className="page-indicator">Page {currentPage} of {totalPages}</span>
                <button 
                    onClick={() => setCurrentPage(p => p + 1)} 
                    disabled={currentPage >= totalPages || filteredOrders.length < ordersPerPage}
                    className="pagination-btn next"
                >
                    Next
                    <FiChevronRight className="pagination-icon" />
                </button>
            </div>
        </div>
    );
};

export default MyOrder;