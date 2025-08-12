import React, { useState, useEffect } from 'react';
import './orderDetail.css';
import { useParams, useNavigate } from 'react-router-dom';

const OrderDetail = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [trackingHistory, setTrackingHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const token = localStorage.getItem('authtoken');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // Fetch order details
                const orderResponse = await fetch(`http://localhost:8099/api/orders/${orderId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!orderResponse.ok) {
                    throw new Error('Failed to fetch order details');
                }

                const orderData = await orderResponse.json();
                setOrder(orderData.order);

                // Fetch tracking history
                const trackingResponse = await fetch(`http://localhost:8099/api/orders/${orderId}/tracking`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (trackingResponse.ok) {
                    const trackingData = await trackingResponse.json();
                    setTrackingHistory(trackingData.history);
                }

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, navigate]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleCancelOrder = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8099/api/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to cancel order');
            }

            // Update the order status
            setOrder({ ...order, status: 'Cancelled' });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleReviewSubmit = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8099/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rating,
                    comment
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            setReviewSubmitted(true);
            setRating(0);
            setComment('');
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div className="loading">Loading order details...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    if (!order) {
        return <div className="no-order">Order not found</div>;
    }

    return (
        <div className="order-detail-container">
            <button className="back-button" onClick={() => navigate(-1)}>← Back to Orders</button>
            
            <div className="order-header">
                <h1>Order #{order.order_id}</h1>
                <div className="order-meta">
                    <span className="order-date">Placed on: {formatDate(order.created_at)}</span>
                    <span className={`order-status ${order.status.toLowerCase()}`}>
                        {order.status}
                    </span>
                </div>
            </div>

            <div className="order-sections">
                <div className="order-section">
                    <h2>Order Summary</h2>
                    <div className="order-items">
                        {order.items.map(item => (
                            <div key={item.order_item_id} className="order-item">
                                <img 
                                    src={`http://localhost:8099/uploads/${item.image_url}`} 
                                    alt={item.product_name} 
                                    className="item-image" 
                                />
                                <div className="item-details">
                                    <h3>{item.product_name}</h3>
                                    <p>{item.variant_name}: {item.variant_value}</p>
                                    <p>Qty: {item.quantity}</p>
                                    <p>Price: Rs. {item.unit_price.toFixed(2)}</p>
                                    <p>Subtotal: Rs. {(item.unit_price * item.quantity).toFixed(2)}</p>
                                </div>
                                {order.status === 'Delivered' && (
                                    <div className="item-review">
                                        {item.review ? (
                                            <div className="review-submitted">
                                                <p>Your review:</p>
                                                <div className="star-rating">
                                                    {'★'.repeat(item.review.rating)}{'☆'.repeat(5 - item.review.rating)}
                                                </div>
                                                <p>{item.review.comment}</p>
                                            </div>
                                        ) : (
                                            <div className="review-form">
                                                <h4>Rate this product</h4>
                                                <div className="star-rating">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <span 
                                                            key={star}
                                                            className={star <= rating ? 'star-filled' : 'star-empty'}
                                                            onClick={() => setRating(star)}
                                                        >
                                                            {star <= rating ? '★' : '☆'}
                                                        </span>
                                                    ))}
                                                </div>
                                                <textarea
                                                    placeholder="Write your review..."
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                />
                                                <button 
                                                    className="submit-review"
                                                    onClick={() => handleReviewSubmit(item.product_id)}
                                                    disabled={rating === 0 || comment.trim() === ''}
                                                >
                                                    Submit Review
                                                </button>
                                                {reviewSubmitted && (
                                                    <p className="review-success">Review submitted successfully!</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="order-section">
                    <h2>Order Total</h2>
                    <div className="order-totals">
                        <div className="total-row">
                            <span>Subtotal:</span>
                            <span>Rs. {order.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <span>Shipping:</span>
                            <span>Rs. 0.00</span>
                        </div>
                        <div className="total-row grand-total">
                            <span>Total:</span>
                            <span>Rs. {order.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="order-section">
                    <h2>Shipping Information</h2>
                    <div className="shipping-info">
                        <p><strong>Name:</strong> {order.shipping_address.name}</p>
                        <p><strong>Address:</strong> {order.shipping_address.address}</p>
                        <p><strong>City:</strong> {order.shipping_address.city}</p>
                        <p><strong>State:</strong> {order.shipping_address.state}</p>
                        <p><strong>Postal Code:</strong> {order.shipping_address.postal_code}</p>
                        <p><strong>Phone:</strong> {order.shipping_address.phone}</p>
                    </div>
                </div>

                {(order.status !== 'Cancelled' && order.status !== 'Delivered') && (
                    <div className="order-section">
                        <h2>Order Tracking</h2>
                        <div className="tracking-timeline">
                            {trackingHistory.length > 0 ? (
                                trackingHistory.map((status, index) => (
                                    <div key={index} className={`timeline-item ${index === 0 ? 'current' : ''}`}>
                                        <div className="timeline-status">
                                            <div className="timeline-dot"></div>
                                            {index < trackingHistory.length - 1 && <div className="timeline-line"></div>}
                                        </div>
                                        <div className="timeline-content">
                                            <h3>{status.new_status}</h3>
                                            <p>{formatDate(status.created_at)}</p>
                                            {status.notes && <p className="timeline-notes">{status.notes}</p>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Tracking information not available yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {(order.status === 'Pending' || order.status === 'Processing') && (
                    <div className="order-actions">
                        <button className="cancel-order" onClick={handleCancelOrder}>
                            Cancel Order
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetail;