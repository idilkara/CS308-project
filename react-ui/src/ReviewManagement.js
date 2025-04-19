import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import './ProductManager.css'; // We'll use the existing CSS
const ReviewManagement = () => {
  const { token } = useAuth();
  
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  // Fetch pending (unapproved) reviews
  useEffect(() => {
    const fetchPendingReviews = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        const response = await fetch('http://localhost/api/reviews/unapproved', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setPendingReviews(data);
        } else {
          throw new Error('Failed to fetch pending reviews');
        }
      } catch (err) {
        console.error('Error fetching pending reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingReviews();
  }, [token]);
  // Approve a review
  const handleApproveReview = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost/api/reviews/approve/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Remove the approved review from the list
        setPendingReviews(pendingReviews.filter(review => review.review_id !== reviewId));
        showNotification('Review approved successfully!', 'success');
      } else {
        throw new Error('Failed to approve review');
      }
    } catch (err) {
      console.error('Error approving review:', err);
      showNotification('Failed to approve review. Please try again.', 'error');
    }
  };
  // Reject (delete) a review
  const handleRejectReview = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost/api/reviews/remove/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Remove the rejected review from the list
        setPendingReviews(pendingReviews.filter(review => review.review_id !== reviewId));
        showNotification('Review rejected successfully!', 'success');
      } else {
        throw new Error('Failed to reject review');
      }
    } catch (err) {
      console.error('Error rejecting review:', err);
      showNotification('Failed to reject review. Please try again.', 'error');
    }
  };
  // Display notification
  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), 3000);
  };
  if (loading) return <div className="pm-loading">Loading reviews...</div>;
  
  if (error) return <div className="error-message">{error}</div>;
  return (
    <div className="pm-comments-section">
      <h2 className="section-title">Manage Reviews</h2>
      
      <div className="pm-comments-header">
        <h3 className="source-sans-semibold">Review Approval</h3>
        <p className="source-sans-light">
          Review and approve user comments before they become visible on the product pages.
          Ratings are automatically approved, but comments require your review.
        </p>
      </div>
      
      {notification.visible && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      {pendingReviews.length === 0 ? (
        <p className="pm-no-comments">No pending reviews to approve at this time.</p>
      ) : (
        <div className="pm-comments-list">
          {pendingReviews.map((review) => (
            <div key={review.review_id} className="pm-comment-card pm-comment-pending">
              <div className="pm-comment-header">
                <div className="pm-comment-product">
                  <span className="source-sans-semibold">Product:</span> 
                  {review.product_name || `Product ID: ${review.product_id}`}
                </div>
                <div className="pm-comment-user">
                  <span className="source-sans-semibold">User:</span> 
                  {review.user_name || `User ID: ${review.user_id}`}
                </div>
                <div className="pm-comment-date">
                  <span className="source-sans-semibold">Date:</span> 
                  {new Date(review.created_at || new Date()).toLocaleDateString()}
                </div>
                <div className="pm-comment-rating">
                  <span className="source-sans-semibold">Rating:</span>
                  <div className="star-rating">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < review.rating ? "star filled" : "star"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pm-comment-content">
                <p className="source-sans-regular">{review.comment}</p>
              </div>
              <div className="pm-comment-actions">
                <button
                  className="pm-btn-approve"
                  onClick={() => handleApproveReview(review.review_id)}
                >
                  Approve
                </button>
                <button
                  className="pm-btn-reject"
                  onClick={() => handleRejectReview(review.review_id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ReviewManagement;
