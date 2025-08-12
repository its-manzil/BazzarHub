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
    const [dateFilter, setDateFilter] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', isError: false });
    const navigate = useNavigate();
    const ordersPerPage = 7;

    // Helper function to process each order item
    const processItem = (item) => ({
        order_item_id: item.order_item_id || 'N/A',
        product_id: item.product_id || 'N/A',
        product_name: item.product_name || 'Unknown Product',
        variant_name: item.variant_name || '',
        variant_value: item.variant_value || '',
        quantity: Number(item.quantity || 1),
        unit_price: Number(item.unit_price || 0),
        image_url: item.image_url || 'product-placeholder.jpg',
        status: item.status || 'Pending'
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

    // Format date for display
    const formatDate = (dateString) => {
        try {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch {
            return 'Unknown date';
        }
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

            // Update local state
            setOrders(prevOrders => 
                prevOrders.map(order => {
                    if (order.order_id === orderId) {
                        // Find and move item to cancelled
                        const itemIndex = order.items.findIndex(item => item.order_item_id === itemId);
                        if (itemIndex === -1) return order;

                        const itemToCancel = order.items[itemIndex];
                        const updatedItems = [...order.items];
                        updatedItems.splice(itemIndex, 1);
                        
                        const updatedCancelledItems = [
                            ...(order.cancelledItems || []),
                            { ...itemToCancel, status: 'Cancelled' }
                        ];

                        // Recalculate active total
                        const newActiveTotal = updatedItems.reduce(
                            (sum, item) => sum + (item.unit_price * item.quantity), 
                            0
                        );

                        // Check if all items cancelled
                        const allCancelled = updatedItems.length === 0;

                        return {
                            ...order,
                            items: updatedItems,
                            cancelledItems: updatedCancelledItems,
                            activeTotal: Number(newActiveTotal.toFixed(2)),
                            status: allCancelled ? 'Cancelled' : order.status
                        };
                    }
                    return order;
                })
            );

            showNotification('Item cancelled successfully');
        } catch (err) {
            console.error('Cancellation error:', err);
            showNotification(err.message || 'Failed to cancel item', true);
        }
    };

    // Handle date filter
    const handleDateFilterChange = (e) => {
        setDateFilter(e.target.value);
        setCurrentPage(1);
        setIsFilterOpen(false);
    };

    // Clear date filter
    const clearDateFilter = () => {
        setDateFilter('');
        setCurrentPage(1);
    };

    // Pagination handlers
    const handleNextPage = () => {
        setCurrentPage(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Fetch orders
    useEffect(() => {
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
                
                // Process orders
                const processedOrders = (data.orders || []).map(order => {
                    const items = Array.isArray(order.items) ? order.items : [];
                    const activeItems = items.filter(item => item.status !== 'Cancelled');
                    const cancelledItems = items.filter(item => item.status === 'Cancelled');

                    const originalTotal = Number(order.total_amount || 0);
                    const activeTotal = activeItems.reduce(
                        (sum, item) => sum + (Number(item.unit_price || 0) * Number(item.quantity || 1)), 
                        0
                    );

                    return {
                        order_id: order.order_id || 'N/A',
                        created_at: order.created_at || new Date().toISOString(),
                        status: order.status || 'Pending',
                        shipping_address: order.shipping_address || {},
                        payment_method: order.payment_method || 'Unknown',
                        items: activeItems.map(processItem),
                        cancelledItems: cancelledItems.map(processItem),
                        originalTotal,
                        activeTotal: Number(activeTotal.toFixed(2))
                    };
                });

                setOrders(processedOrders);
            } catch (err) {
                console.error('Fetch orders error:', err);
                setError(err.message || 'Failed to load orders');
                showNotification(err.message || 'Failed to load orders', true);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate, currentPage, dateFilter]);

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

    if (orders.length === 0) {
        return (
            <div className="no-orders">
                <img 
                    src="/empty-orders.svg" 
                    alt="No orders" 
                    className="empty-illustration" 
                    onError={(e) => {
                        e.target.src = '/default-empty.svg';
                    }}
                />
                <h2>No Orders Found</h2>
                <p>{dateFilter ? 'No orders match your filter' : 'You haven\'t placed any orders yet'}</p>
                {dateFilter && (
                    <button 
                        className="clear-filter-btn"
                        onClick={clearDateFilter}
                    >
                        Clear Filter
                    </button>
                )}
                <button 
                    className="shop-now-btn" 
                    onClick={() => navigate('/')}
                >
                    Start Shopping
                </button>
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
                        Page {currentPage} • Showing {orders.length} orders
                    </div>
                </div>
            </div>

            <div className="orders-section">
                <h2 className="section-title">Active Orders</h2>
                <div className="orders-grid">
                    {orders.filter(order => order.status !== 'Cancelled').map(order => (
                        <div key={order.order_id} className="order-card">
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
                                    Total: <span>{formatPrice(order.activeTotal)}</span>
                                    {order.activeTotal !== order.originalTotal && (
                                        <span className="original-price">
                                            <del>{formatPrice(order.originalTotal)}</del>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="order-items">
                                {order.items.map(item => (
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
                                                {(item.status === 'Pending' || item.status === 'Processing') && (
                                                    <button 
                                                        className="cancel-item-btn"
                                                        onClick={() => handleCancelItem(order.order_id, item.order_item_id)}
                                                    >
                                                        Cancel Item
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {order.cancelledItems && order.cancelledItems.length > 0 && (
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
                        </div>
                    ))}
                </div>
            </div>

            {orders.filter(order => order.status === 'Cancelled').length > 0 && (
                <div className="orders-section cancelled-orders">
                    <h2 className="section-title">Cancelled Orders</h2>
                    <div className="orders-grid">
                        {orders.filter(order => order.status === 'Cancelled').map(order => (
                            <div key={order.order_id} className="order-card cancelled">
                                <div className="order-header">
                                    <div className="order-meta">
                                        <span className="order-id">Order #{order.order_id}</span>
                                        <span className="order-date">{formatDateTime(order.created_at)}</span>
                                        <span className="order-status cancelled">
                                            <FiX className="status-icon" />
                                            Cancelled
                                        </span>
                                    </div>
                                    <div className="order-total">
                                        Original Total: <span>{formatPrice(order.originalTotal)}</span>
                                    </div>
                                </div>

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
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="pagination-controls">
                <button 
                    onClick={handlePrevPage} 
                    disabled={currentPage === 1}
                    className="pagination-btn prev"
                >
                    <FiChevronLeft className="pagination-icon" />
                    Previous
                </button>
                <span className="page-indicator">Page {currentPage}</span>
                <button 
                    onClick={handleNextPage} 
                    disabled={orders.length < ordersPerPage}
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