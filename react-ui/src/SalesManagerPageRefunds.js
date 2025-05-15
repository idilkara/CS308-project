import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './SalemsManagerPageRefunds.css';

const SalesManagerPageRefunds = ({ token }) => {
  const [refundRequests, setRefundRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingRefunds, setProcessingRefunds] = useState({}); // Track refunds being processed

  useEffect(() => {
    if (token) {
      fetchRefundRequests();
    }
  }, [token]);

  const fetchRefundRequests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await fetch('http://localhost/api/refunds/refund-requests', {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch refund requests: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(data);
      setRefundRequests(data);
    } catch (err) {
      console.error('Error fetching refund requests:', err);
      setError('Failed to load refund requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRefund = async (refundId) => {
    // Set this refund as processing
    setProcessingRefunds(prev => ({ ...prev, [refundId]: true }));
    
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(`http://localhost/api/refunds/approve-refund/${refundId}`, {
        method: 'POST',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve refund');
      }
      
      const result = await response.json();
      
      // Only update the state after we have confirmation of success
      setRefundRequests(prev => 
        prev.map(refund => 
          refund.refund_id === refundId 
            ? { ...refund, status: 'approved' } 
            : refund
        )
      );
      
      toast.success(`Refund approved successfully. Amount: $${result.refunded_amount}`);
    } catch (err) {
      console.error('Error approving refund:', err);
      toast.error(err.message || 'Failed to approve refund');
    } finally {
      // Remove processing state regardless of outcome
      setProcessingRefunds(prev => {
        const updated = { ...prev };
        delete updated[refundId];
        return updated;
      });
    }
  };

  const handleRejectRefund = async (refundId) => {
    // Set this refund as processing
    setProcessingRefunds(prev => ({ ...prev, [refundId]: true }));
    
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(`http://localhost/api/refunds/reject-refund/${refundId}`, {
        method: 'POST',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject refund');
      }
      
      // Only update the status after confirmed success
      setRefundRequests(prev => 
        prev.map(refund => 
          refund.refund_id === refundId 
            ? { ...refund, status: 'rejected' } 
            : refund
        )
      );
      
      toast.info('Refund request rejected');
    } catch (err) {
      console.error('Error rejecting refund:', err);
      toast.error(err.message || 'Failed to reject refund');
    } finally {
      // Remove processing state regardless of outcome
      setProcessingRefunds(prev => {
        const updated = { ...prev };
        delete updated[refundId];
        return updated;
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <div className="refund-loading">Loading refund requests...</div>;
  }

  if (error) {
    return <div className="refund-error">{error}</div>;
  }

  return (
    <div className="refunds-container">
      <h2 className="source-sans-semibold">Manage Refund Requests</h2>
      
      <div className="refund-actions">
        <button onClick={fetchRefundRequests} className="refresh-btn">
          Refresh Requests
        </button>
      </div>
      
      {refundRequests.length === 0 ? (
        <div className="no-refunds">No refund requests found.</div>
      ) : (
        <div className="refund-table-container">
          <table className="refund-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Order</th>
                <th>Product</th>
                <th>Product Name</th>
                <th>Amount</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {refundRequests.map(refund => (
                <tr key={refund.refund_id} className={`refund-row status-${refund.status}`}>
                  <td>#{refund.refund_id}</td>
                  <td>{refund.username}</td>
                  <td>#{refund.order_id}</td>
                  <td>{refund.product_id}</td>
                  <td>{refund.product_name}</td>
                  <td>${parseFloat(refund.refund_amount).toFixed(2)}</td>
                  <td>{formatDate(refund.request_date)}</td>
                  <td>
                    <span className={`status-badge ${refund.status}`}>
                      {refund.status}
                    </span>
                  </td>
                  <td className="refund-actions-cell">
                    {refund.status === 'requested' ? (
                      processingRefunds[refund.refund_id] ? (
                        <div className="processing-actions">
                          <span className="processing-text">Processing...</span>
                        </div>
                      ) : (
                        <div className="refund-buttons">
                          <button 
                            onClick={() => handleApproveRefund(refund.refund_id)}
                            className="approve-btn"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectRefund(refund.refund_id)}
                            className="reject-btn"
                          >
                            Reject
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="action-taken">
                        {refund.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesManagerPageRefunds;