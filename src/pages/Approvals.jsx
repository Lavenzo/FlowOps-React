import { useState, useMemo } from 'react';
import { ALL_REQUESTS } from '../data/requests';
import Modal from '../components/Modal';
import { getStatusClass, getPriorityClass } from '../utils/badge';
import './Approvals.css';

export default function Approvals({ user, newRequests = [], updatedRequests = {}, onUpdateRequest }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const combinedRequests = useMemo(() => {
    return [...newRequests, ...ALL_REQUESTS].map(req => {
      if (updatedRequests[req.id]) {
        return { ...req, ...updatedRequests[req.id] };
      }
      return req;
    });
  }, [newRequests, updatedRequests]);

  const pendingRequests = useMemo(() => {
    return combinedRequests.filter(req => req.status === 'Pending Approval');
  }, [combinedRequests]);

  const requestTypes = useMemo(() => {
    const types = new Set(pendingRequests.map(req => req.type));
    return Array.from(types).sort();
  }, [pendingRequests]);

  const filteredRequests = useMemo(() => {
    return pendingRequests.filter(req => {
      const matchesSearch =
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requester.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = priorityFilter === '' || req.priority === priorityFilter;
      const matchesType = typeFilter === '' || req.type === typeFilter;

      return matchesSearch && matchesPriority && matchesType;
    });
  }, [pendingRequests, searchQuery, priorityFilter, typeFilter]);

  if (user?.role !== 'Approver') {
    return (
      <div className="approvals-container">
        <div className="restricted-access">
          <div className="restricted-icon" aria-hidden="true">🔒</div>
          <h2 className="restricted-title">Access Restricted</h2>
          <p className="restricted-message">
            You do not have the required permissions to view or action approvals.
          </p>
        </div>
      </div>
    );
  }

  const handleClearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('');
    setTypeFilter('');
  };

  const openReviewModal = (request) => {
    setSelectedRequest(request);
    setApprovalComment('');
    setCommentError('');
    setSuccessMessage('');
  };

  const closeReviewModal = () => {
    setSelectedRequest(null);
    setApprovalComment('');
    setCommentError('');
  };

  const handleAction = (action) => {
    if (!approvalComment.trim()) {
      setCommentError(action === 'Approve' ? 'Approval comment is required.' : 'Rejection reason is required.');
      return;
    }

    const updates = {
      status: action === 'Approve' ? 'Approved' : 'Rejected',
      approvalAction: action === 'Approve' ? 'Approved' : 'Rejected',
      approver: user.username,
      approvalComment: approvalComment.trim()
    };

    onUpdateRequest(selectedRequest.id, updates);
    setSuccessMessage(`Request ${selectedRequest.id} ${action === 'Approve' ? 'approved' : 'rejected'} successfully.`);
    closeReviewModal();
  };

  return (
    <div className="approvals-container">
      <div className="page-header">
        <h2 className="page-title">Approvals</h2>
        <p className="page-subtitle">Review and action requests awaiting your approval.</p>
      </div>

      {successMessage && (
        <div className="success-message" role="alert">
          {successMessage}
        </div>
      )}

      <div className="table-section">
        <div className="table-header">
          <div className="filters">
            <input
              type="text"
              placeholder="Search ID, Title, or Requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
              aria-label="Search Approvals"
            />

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by Priority"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by Request Type"
            >
              <option value="">All Request Types</option>
              {requestTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <button onClick={handleClearFilters} className="btn-secondary">
              Clear Filters
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Request Type</th>
                <th>Title</th>
                <th>Submitted Date</th>
                <th>Priority</th>
                <th>Requester</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map(req => (
                  <tr key={req.id}>
                    <td className="font-medium">{req.id}</td>
                    <td>{req.type}</td>
                    <td>{req.title}</td>
                    <td>{req.submittedDate}</td>
                    <td>
                      <span className={`badge ${getPriorityClass(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td>{req.requester}</td>
                    <td>
                      <span className={`badge ${getStatusClass(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => openReviewModal(req)}
                        aria-label={`Review request ${req.id}`}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-state">
                    No pending approvals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <Modal onClose={closeReviewModal} title="Review Request">
          <div className="review-modal-content">
            <div className="review-details-section">
              <h4>Request Information</h4>
              <div className="request-details">
                <div className="detail-row">
                  <span className="detail-label">Request ID:</span>
                  <span className="detail-value font-medium">{selectedRequest.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Request Type:</span>
                  <span className="detail-value">{selectedRequest.type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Title:</span>
                  <span className="detail-value">{selectedRequest.title}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value description-text">{selectedRequest.description}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Submitted Date:</span>
                  <span className="detail-value">{selectedRequest.submittedDate}</span>
                </div>
                {selectedRequest.requiredByDate && (
                  <div className="detail-row">
                    <span className="detail-label">Required By Date:</span>
                    <span className="detail-value">{selectedRequest.requiredByDate}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Priority:</span>
                  <span className="detail-value">
                    <span className={`badge ${getPriorityClass(selectedRequest.priority)}`}>
                      {selectedRequest.priority}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Requester:</span>
                  <span className="detail-value">{selectedRequest.requester}</span>
                </div>
                {selectedRequest.businessJustification && (
                  <div className="detail-row">
                    <span className="detail-label">Business Justification:</span>
                    <span className="detail-value description-text">{selectedRequest.businessJustification}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Current Status:</span>
                  <span className="detail-value">
                    <span className={`badge ${getStatusClass(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="approval-form">
              <div className="approval-form-group">
                <label htmlFor="approvalComment" className="approval-form-label required">
                  Approval / Rejection Comment
                </label>
                <textarea
                  id="approvalComment"
                  value={approvalComment}
                  onChange={(e) => {
                    setApprovalComment(e.target.value);
                    if (commentError) setCommentError('');
                  }}
                  className="approval-form-textarea"
                  aria-required="true"
                  aria-invalid={!!commentError}
                  placeholder="Provide a reason for approval or rejection..."
                />
                {commentError && (
                  <span className="error-message" role="alert">{commentError}</span>
                )}
              </div>
              <div className="review-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeReviewModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-reject"
                  onClick={() => handleAction('Reject')}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="btn-approve"
                  onClick={() => handleAction('Approve')}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
